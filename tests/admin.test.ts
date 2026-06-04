import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/db";
import {
  listPending,
  approveForwarder,
  rejectForwarder,
  suspendForwarder,
  AlreadyApprovedError,
  ReasonRequiredError,
} from "@/lib/admin/moderation";
import { createSignedDocPath, verifyDocSignature } from "@/lib/admin/signed-url";

let adminId = "";
const ids: Record<string, string> = {};
const slugs = ["zztest-mod-a", "zztest-mod-b", "zztest-mod-c"];

async function mkForwarder(slug: string, status: "pending" | "approved") {
  const email = `${slug}@test.example`;
  const owner = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash: "x", role: "forwarder", emailVerified: true },
  });
  const f = await prisma.forwarderProfile.upsert({
    where: { slug },
    update: { status, verified: status === "approved" },
    create: {
      ownerUserId: owner.id,
      slug,
      companyName: `ZZ Mod ${slug}`,
      primaryCountry: "DE",
      status,
      verified: status === "approved",
      modes: ["sea_fcl"],
      services: ["customs_clearance"],
      countries: { create: [{ country: "DE", isHeadquarters: true, ports: [] }] },
      documents: {
        create: [{ type: "business_registration", storageKey: "k/x.pdf", mimeType: "application/pdf", sizeBytes: 100 }],
      },
    },
    select: { id: true },
  });
  return f.id;
}

beforeAll(async () => {
  const admin = await prisma.user.upsert({
    where: { email: "zzadmin@test.example" },
    update: { role: "admin" },
    create: { email: "zzadmin@test.example", passwordHash: "x", role: "admin", emailVerified: true },
  });
  adminId = admin.id;
  ids.a = await mkForwarder("zztest-mod-a", "pending");
  ids.b = await mkForwarder("zztest-mod-b", "pending");
  ids.c = await mkForwarder("zztest-mod-c", "approved");
});

afterAll(async () => {
  await prisma.auditLog.deleteMany({ where: { targetId: { in: Object.values(ids) } } });
  await prisma.forwarderProfile.deleteMany({ where: { slug: { in: slugs } } });
  await prisma.user.deleteMany({
    where: { email: { in: [...slugs.map((s) => `${s}@test.example`), "zzadmin@test.example"] } },
  });
  await prisma.$disconnect();
});

describe("review queue", () => {
  it("lists pending applications", async () => {
    const pending = await listPending();
    expect(pending.map((p) => p.id)).toContain(ids.a);
    expect(pending.map((p) => p.id)).not.toContain(ids.c); // approved not in queue
  });
});

describe("approveForwarder", () => {
  it("approves, sets verified, writes an audit log, and is not idempotent on re-approve", async () => {
    const res = await approveForwarder(adminId, ids.a);
    expect(res.status).toBe("approved");
    expect(res.verified).toBe(true);

    const profile = await prisma.forwarderProfile.findUnique({ where: { id: ids.a }, select: { status: true, verified: true, reviewedById: true } });
    expect(profile?.verified).toBe(true);
    expect(profile?.reviewedById).toBe(adminId);

    const audits = await prisma.auditLog.count({ where: { action: "forwarder.approve", targetId: ids.a } });
    expect(audits).toBe(1);

    await expect(approveForwarder(adminId, ids.a)).rejects.toBeInstanceOf(AlreadyApprovedError);
  });
});

describe("rejectForwarder", () => {
  it("requires a reason", async () => {
    await expect(rejectForwarder(adminId, ids.b, "  ")).rejects.toBeInstanceOf(ReasonRequiredError);
  });
  it("rejects with a reason and records it", async () => {
    const res = await rejectForwarder(adminId, ids.b, "Document unreadable");
    expect(res.status).toBe("rejected");
    const profile = await prisma.forwarderProfile.findUnique({ where: { id: ids.b }, select: { status: true, rejectionReason: true } });
    expect(profile?.rejectionReason).toBe("Document unreadable");
  });
});

describe("suspendForwarder", () => {
  it("suspends an approved profile (removed from directory)", async () => {
    const res = await suspendForwarder(adminId, ids.c);
    expect(res.status).toBe("suspended");
  });
});

describe("signed KYC document URLs", () => {
  it("round-trips a valid signature and rejects tampering/expiry", () => {
    const path = createSignedDocPath("doc_123");
    const url = new URL(`http://x${path}`);
    const exp = url.searchParams.get("exp");
    const sig = url.searchParams.get("sig");
    expect(verifyDocSignature("doc_123", exp, sig)).toBe(true);
    expect(verifyDocSignature("doc_123", exp, "deadbeef")).toBe(false);
    expect(verifyDocSignature("other_doc", exp, sig)).toBe(false);
    expect(verifyDocSignature("doc_123", "1", sig)).toBe(false); // expired
  });
});
