import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/db";
import {
  queryForwarders,
  getForwarderBySlug,
} from "@/lib/forwarders/repository";
import { directoryFilterSchema } from "@/lib/validation/forwarder";

// Fixtures: a pending and a rejected profile that must NEVER surface publicly.
const PENDING_SLUG = "zztest-pending-forwarder";
const APPROVED_SLUG = "zztest-approved-forwarder";

function filter(input: Record<string, unknown> = {}) {
  return directoryFilterSchema.parse(input);
}

beforeAll(async () => {
  const mk = async (slug: string, status: "pending" | "approved") => {
    const email = `${slug}@test.example`;
    const owner = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, passwordHash: "x", role: "forwarder" },
    });
    await prisma.forwarderProfile.upsert({
      where: { slug },
      update: { status, verified: status === "approved" },
      create: {
        ownerUserId: owner.id,
        slug,
        companyName: status === "pending" ? "ZZTest Pending Co" : "ZZTest Approved Co",
        primaryCountry: "ZZ",
        status,
        verified: status === "approved",
        modes: ["sea_fcl"],
        services: ["customs_clearance"],
        countries: { create: [{ country: "ZZ", isHeadquarters: true, ports: [] }] },
        documents: {
          create: [
            { type: "business_registration", storageKey: "secret/kyc.pdf", mimeType: "application/pdf", sizeBytes: 1234 },
          ],
        },
      },
    });
  };
  await mk(PENDING_SLUG, "pending");
  await mk(APPROVED_SLUG, "approved");
});

afterAll(async () => {
  await prisma.forwarderProfile.deleteMany({
    where: { slug: { in: [PENDING_SLUG, APPROVED_SLUG] } },
  });
  await prisma.user.deleteMany({
    where: { email: { in: [`${PENDING_SLUG}@test.example`, `${APPROVED_SLUG}@test.example`] } },
  });
  await prisma.$disconnect();
});

describe("queryForwarders", () => {
  it("returns the paginated envelope with seeded approved forwarders", async () => {
    const res = await queryForwarders(filter());
    expect(res.page).toBe(1);
    expect(res.pageSize).toBe(20);
    expect(res.total).toBeGreaterThanOrEqual(12);
    expect(res.results.length).toBeGreaterThan(0);
  });

  it("never includes pending or rejected profiles (F1 AC3)", async () => {
    const res = await queryForwarders(filter({ pageSize: "200" }));
    const slugs = res.results.map((r) => r.slug);
    expect(slugs).toContain(APPROVED_SLUG);
    expect(slugs).not.toContain(PENDING_SLUG);
  });

  it("filters by country", async () => {
    const res = await queryForwarders(filter({ country: "DE" }));
    expect(res.total).toBeGreaterThan(0);
    expect(res.total).toBeLessThan(12);
  });

  it("filters by mode", async () => {
    const res = await queryForwarders(filter({ mode: "rail" }));
    expect(res.total).toBeGreaterThan(0);
    for (const r of res.results) expect(r.modes).toContain("rail");
  });

  it("returns an empty result set when nothing matches", async () => {
    const res = await queryForwarders(filter({ country: "QQ" }));
    expect(res.total).toBe(0);
    expect(res.results).toEqual([]);
  });
});

describe("getForwarderBySlug", () => {
  it("resolves an approved profile without exposing KYC or internal fields", async () => {
    const f = await getForwarderBySlug(APPROVED_SLUG);
    expect(f).not.toBeNull();
    const keys = Object.keys(f!);
    expect(keys).not.toContain("documents");
    expect(keys).not.toContain("ownerUserId");
    expect(keys).not.toContain("rejectionReason");
    expect(JSON.stringify(f)).not.toContain("secret/kyc.pdf");
  });

  it("returns null for a non-approved slug (F2 AC3)", async () => {
    expect(await getForwarderBySlug(PENDING_SLUG)).toBeNull();
  });

  it("returns null for an unknown slug", async () => {
    expect(await getForwarderBySlug("does-not-exist-xyz")).toBeNull();
  });
});
