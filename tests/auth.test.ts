import { describe, it, expect, afterAll } from "vitest";
import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { registerSchema } from "@/lib/validation/auth";
import { verifyCredentials } from "@/lib/auth/credentials";
import { registerUser, EmailTakenError } from "@/lib/auth/register";
import {
  createVerificationToken,
  consumeVerificationToken,
} from "@/lib/auth/tokens";

const EMAILS = [
  "zzauth-creds@test.example",
  "zzauth-register@test.example",
  "zzauth-token@test.example",
];

afterAll(async () => {
  await prisma.verificationToken.deleteMany({ where: { identifier: { in: EMAILS } } });
  await prisma.user.deleteMany({ where: { email: { in: EMAILS } } });
  await prisma.$disconnect();
});

describe("password hashing", () => {
  it("hashes and verifies, rejecting wrong passwords", async () => {
    const hash = await hashPassword("Sup3rSecret");
    expect(hash).not.toBe("Sup3rSecret");
    expect(await verifyPassword("Sup3rSecret", hash)).toBe(true);
    expect(await verifyPassword("wrong", hash)).toBe(false);
  });
});

describe("registerSchema", () => {
  it("rejects weak passwords and accepts strong ones", () => {
    expect(registerSchema.safeParse({ email: "a@b.com", password: "short", role: "shipper" }).success).toBe(false);
    expect(registerSchema.safeParse({ email: "a@b.com", password: "allletters", role: "shipper" }).success).toBe(false);
    expect(registerSchema.safeParse({ email: "a@b.com", password: "letters123", role: "shipper" }).success).toBe(true);
  });
  it("does not allow registering as admin", () => {
    expect(registerSchema.safeParse({ email: "a@b.com", password: "letters123", role: "admin" }).success).toBe(false);
  });
});

describe("verifyCredentials (no user enumeration)", () => {
  it("returns null for an unknown email", async () => {
    expect(await verifyCredentials("nobody-xyz@test.example", "letters123")).toBeNull();
  });

  it("returns null for a wrong password, user for the right one", async () => {
    const email = "zzauth-creds@test.example";
    const passwordHash = await hashPassword("letters123");
    await prisma.user.upsert({
      where: { email },
      update: { passwordHash },
      create: { email, passwordHash, role: "shipper" },
    });
    expect(await verifyCredentials(email, "wrongpass1")).toBeNull();
    const ok = await verifyCredentials(email, "letters123");
    expect(ok).not.toBeNull();
    expect(ok!.role).toBe("shipper");
  });
});

describe("registerUser", () => {
  it("creates a user with a hashed password, unverified, then 409 on duplicate", async () => {
    const email = "zzauth-register@test.example";
    await prisma.user.deleteMany({ where: { email } });
    const { id } = await registerUser({ email, password: "letters123", role: "forwarder" });
    expect(id).toBeTruthy();

    const row = await prisma.user.findUnique({ where: { email } });
    expect(row?.passwordHash).not.toBe("letters123");
    expect(row?.emailVerified).toBe(false);
    expect(row?.role).toBe("forwarder");

    await expect(
      registerUser({ email, password: "letters123", role: "forwarder" }),
    ).rejects.toBeInstanceOf(EmailTakenError);
  });
});

describe("email verification tokens", () => {
  it("marks the user verified on consume, and is single-use", async () => {
    const email = "zzauth-token@test.example";
    await prisma.user.upsert({
      where: { email },
      update: { emailVerified: false },
      create: { email, passwordHash: "x", role: "shipper", emailVerified: false },
    });
    const token = await createVerificationToken(email);

    const res = await consumeVerificationToken(token);
    expect(res.ok).toBe(true);
    expect((await prisma.user.findUnique({ where: { email } }))?.emailVerified).toBe(true);

    // token is single-use
    const again = await consumeVerificationToken(token);
    expect(again.ok).toBe(false);
  });

  it("rejects an invalid token", async () => {
    const res = await consumeVerificationToken("not-a-real-token");
    expect(res).toEqual({ ok: false, reason: "invalid" });
  });
});
