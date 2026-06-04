import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { promises as fs } from "node:fs";
import path from "node:path";
import { prisma } from "@/lib/db";
import {
  saveDraft,
  addKycDocument,
  submitForReview,
  IncompleteError,
  NotVerifiedError,
} from "@/lib/forwarders/onboarding";

const VERIFIED = "zzon-verified@test.example";
const UNVERIFIED = "zzon-unverified@test.example";
let verifiedId = "";
let unverifiedId = "";

const draftInput = {
  companyName: "ZZOnboarding Co",
  primaryCountry: "DE",
  countriesServed: [{ country: "DE", isHeadquarters: true, ports: [] }],
  modes: ["sea_fcl"],
  services: ["customs_clearance"],
};

beforeAll(async () => {
  const v = await prisma.user.upsert({
    where: { email: VERIFIED },
    update: { emailVerified: true },
    create: { email: VERIFIED, passwordHash: "x", role: "forwarder", emailVerified: true },
  });
  const u = await prisma.user.upsert({
    where: { email: UNVERIFIED },
    update: { emailVerified: false },
    create: { email: UNVERIFIED, passwordHash: "x", role: "forwarder", emailVerified: false },
  });
  verifiedId = v.id;
  unverifiedId = u.id;
});

afterAll(async () => {
  await prisma.forwarderProfile.deleteMany({
    where: { ownerUserId: { in: [verifiedId, unverifiedId] } },
  });
  await prisma.user.deleteMany({ where: { email: { in: [VERIFIED, UNVERIFIED] } } });
  await fs.rm(path.join(process.cwd(), ".uploads", "kyc"), { recursive: true, force: true });
  await prisma.$disconnect();
});

describe("saveDraft", () => {
  it("creates a draft with a server-generated slug", async () => {
    const draft = await saveDraft(verifiedId, draftInput);
    expect(draft.status).toBe("draft");
    expect(draft.slug).toContain("zzonboarding-co-de");
  });

  it("updates the same profile on a second save (1:1)", async () => {
    const first = await saveDraft(verifiedId, draftInput);
    const second = await saveDraft(verifiedId, { ...draftInput, about: "Updated" });
    expect(second.id).toBe(first.id);
    const count = await prisma.forwarderProfile.count({ where: { ownerUserId: verifiedId } });
    expect(count).toBe(1);
  });
});

describe("submitForReview", () => {
  it("blocks an incomplete draft (no KYC document yet)", async () => {
    await saveDraft(verifiedId, draftInput);
    await expect(submitForReview(verifiedId)).rejects.toMatchObject({
      name: "IncompleteError",
    });
    try {
      await submitForReview(verifiedId);
    } catch (e) {
      expect((e as IncompleteError).missing).toContain("kycDocument");
    }
  });

  it("blocks an unverified user even when complete", async () => {
    await saveDraft(unverifiedId, draftInput);
    await addKycDocument(unverifiedId, {
      filename: "reg.pdf",
      type: "business_registration",
      mimeType: "application/pdf",
      data: Buffer.from("dummy-pdf"),
    });
    await expect(submitForReview(unverifiedId)).rejects.toBeInstanceOf(NotVerifiedError);
  });

  it("transitions draft → pending when complete and verified", async () => {
    await saveDraft(verifiedId, draftInput);
    await addKycDocument(verifiedId, {
      filename: "reg.pdf",
      type: "business_registration",
      mimeType: "application/pdf",
      data: Buffer.from("dummy-pdf"),
    });
    const res = await submitForReview(verifiedId);
    expect(res.status).toBe("pending");

    const profile = await prisma.forwarderProfile.findUnique({
      where: { ownerUserId: verifiedId },
      select: { status: true },
    });
    expect(profile?.status).toBe("pending");
  });

  it("is idempotent once pending (no double transition)", async () => {
    const res = await submitForReview(verifiedId);
    expect(res.status).toBe("pending");
  });
});
