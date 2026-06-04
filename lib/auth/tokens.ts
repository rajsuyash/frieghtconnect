import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/db";

const TTL_MS = 1000 * 60 * 60 * 24; // 24h

/** Issue a single-use email-verification token for an address. */
export async function createVerificationToken(email: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  await prisma.verificationToken.create({
    data: { identifier: email, token, expires: new Date(Date.now() + TTL_MS) },
  });
  return token;
}

export type ConsumeResult =
  | { ok: true; email: string }
  | { ok: false; reason: "invalid" | "expired" };

/** Consume a token: mark the user verified, delete the token. Single-use. */
export async function consumeVerificationToken(
  token: string,
): Promise<ConsumeResult> {
  const row = await prisma.verificationToken.findUnique({ where: { token } });
  if (!row) return { ok: false, reason: "invalid" };

  await prisma.verificationToken.delete({ where: { token } });
  if (row.expires < new Date()) return { ok: false, reason: "expired" };

  await prisma.user.update({
    where: { email: row.identifier },
    data: { emailVerified: true },
  });
  return { ok: true, email: row.identifier };
}
