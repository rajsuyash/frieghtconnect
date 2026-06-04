import { describe, it, expect, beforeEach, afterAll, vi } from "vitest";

// Mutable Clerk session state the mock reads at call time.
// (vitest requires factory-referenced vars to be `mock`-prefixed.)
let mockUserId: string | null = null;
let mockClerkUser: unknown = null;

vi.mock("@clerk/nextjs/server", () => ({
  auth: async () => ({ userId: mockUserId }),
  currentUser: async () => mockClerkUser,
}));

import { prisma } from "@/lib/db";
import { syncCurrentUser, promoteToForwarder } from "@/lib/auth/sync";

function clerkUser(email: string, verified = true) {
  const verification = { status: verified ? "verified" : "unverified" };
  return {
    primaryEmailAddress: { emailAddress: email, verification },
    emailAddresses: [{ emailAddress: email, verification }],
  };
}

const NEW_EMAIL = "zzsync-new@test.example";
const LINK_EMAIL = "zzsync-link@test.example";
const CLERK_NEW = "clerk_zzsync_new";
const CLERK_LINK = "clerk_zzsync_link";

beforeEach(() => {
  mockUserId = null;
  mockClerkUser = null;
});

afterAll(async () => {
  await prisma.user.deleteMany({
    where: { OR: [{ email: { startsWith: "zzsync-" } }, { clerkId: { startsWith: "clerk_zzsync_" } }] },
  });
});

describe("syncCurrentUser", () => {
  it("returns null when signed out", async () => {
    mockUserId = null;
    expect(await syncCurrentUser()).toBeNull();
  });

  it("creates a shipper on first sign-in and stores clerkId", async () => {
    await prisma.user.deleteMany({ where: { clerkId: CLERK_NEW } });
    mockUserId = CLERK_NEW;
    mockClerkUser = clerkUser(NEW_EMAIL, true);

    const user = await syncCurrentUser();
    expect(user).not.toBeNull();
    expect(user?.role).toBe("shipper");
    expect(user?.email).toBe(NEW_EMAIL);
    expect(user?.isVerified).toBe(true);

    const row = await prisma.user.findUnique({ where: { clerkId: CLERK_NEW } });
    expect(row?.email).toBe(NEW_EMAIL);
  });

  it("links an existing email row (seed/admin) by setting its clerkId", async () => {
    const existing = await prisma.user.upsert({
      where: { email: LINK_EMAIL },
      update: { clerkId: null, role: "forwarder" },
      create: { email: LINK_EMAIL, role: "forwarder", emailVerified: false },
    });
    mockUserId = CLERK_LINK;
    mockClerkUser = clerkUser(LINK_EMAIL, true);

    const user = await syncCurrentUser();
    expect(user?.id).toBe(existing.id);
    expect(user?.role).toBe("forwarder"); // role preserved, not reset to shipper
    expect(user?.isVerified).toBe(true); // verified flag synced from Clerk

    const row = await prisma.user.findUnique({ where: { id: existing.id } });
    expect(row?.clerkId).toBe(CLERK_LINK);
  });
});

describe("promoteToForwarder", () => {
  it("promotes a shipper to forwarder", async () => {
    const u = await prisma.user.create({
      data: { email: "zzsync-promote@test.example", role: "shipper", emailVerified: true },
    });
    await promoteToForwarder(u.id);
    const row = await prisma.user.findUnique({ where: { id: u.id } });
    expect(row?.role).toBe("forwarder");
  });

  it("is a no-op for an admin", async () => {
    const u = await prisma.user.create({
      data: { email: "zzsync-admin@test.example", role: "admin", emailVerified: true },
    });
    await promoteToForwarder(u.id);
    const row = await prisma.user.findUnique({ where: { id: u.id } });
    expect(row?.role).toBe("admin");
  });
});
