import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/db";
import { getMyForwarder, getMyInquiries } from "@/lib/dashboard/queries";

const A = "zzdash-a@test.example";
const B = "zzdash-b@test.example";
const ids: Record<string, string> = {};

async function mk(email: string, slug: string) {
  const owner = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash: "x", role: "forwarder", emailVerified: true },
  });
  const f = await prisma.forwarderProfile.upsert({
    where: { slug },
    update: {},
    create: {
      ownerUserId: owner.id,
      slug,
      companyName: `ZZDash ${slug}`,
      primaryCountry: "DE",
      status: "approved",
      verified: true,
      modes: ["sea_fcl"],
      services: [],
    },
    select: { id: true },
  });
  return { ownerId: owner.id, forwarderId: f.id };
}

beforeAll(async () => {
  const a = await mk(A, "zzdash-a");
  const b = await mk(B, "zzdash-b");
  ids.aOwner = a.ownerId;
  ids.bOwner = b.ownerId;
  await prisma.inquiry.createMany({
    data: [
      { forwarderId: a.forwarderId, shipperName: "Buyer One", shipperEmail: "one@x.example", message: "for A only", status: "sent" },
      { forwarderId: a.forwarderId, shipperName: "Buyer Two", shipperEmail: "two@x.example", message: "also A", status: "sent" },
      { forwarderId: b.forwarderId, shipperName: "Buyer Three", shipperEmail: "three@x.example", message: "for B", status: "sent" },
    ],
  });
});

afterAll(async () => {
  await prisma.inquiry.deleteMany({ where: { shipperEmail: { in: ["one@x.example", "two@x.example", "three@x.example"] } } });
  await prisma.forwarderProfile.deleteMany({ where: { slug: { in: ["zzdash-a", "zzdash-b"] } } });
  await prisma.user.deleteMany({ where: { email: { in: [A, B] } } });
  await prisma.$disconnect();
});

describe("getMyInquiries", () => {
  it("returns only the owner's inquiries, newest first", async () => {
    const aInq = await getMyInquiries(ids.aOwner);
    expect(aInq.length).toBe(2);
    expect(aInq.every((i) => i.message.includes("A"))).toBe(true);

    const bInq = await getMyInquiries(ids.bOwner);
    expect(bInq.length).toBe(1);
    expect(bInq[0].shipperName).toBe("Buyer Three");
  });

  it("returns [] for a user with no forwarder profile", async () => {
    const u = await prisma.user.create({ data: { email: "zzdash-none@test.example", passwordHash: "x", role: "forwarder" } });
    expect(await getMyInquiries(u.id)).toEqual([]);
    await prisma.user.delete({ where: { id: u.id } });
  });
});

describe("getMyForwarder", () => {
  it("returns the owner's profile with counts", async () => {
    const f = await getMyForwarder(ids.aOwner);
    expect(f?.companyName).toBe("ZZDash zzdash-a");
    expect(f?._count.inquiries).toBe(2);
  });
});
