import type { Role } from "@prisma/client";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  isVerified: boolean;
}

// A valid bcrypt hash to compare against when the user doesn't exist, so the
// response time is the same whether the email is unknown or the password wrong
// (no user enumeration — PRD F6 AC5).
const DUMMY_HASH = "$2b$12$abcdefghijklmnopqrstuuLf8X0m0Yx0xqgk4q8m1Vw9xj3qg3hYy";

export async function verifyCredentials(
  email: string,
  password: string,
): Promise<AuthUser | null> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    await verifyPassword(password, DUMMY_HASH);
    return null;
  }
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return null;
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    isVerified: user.emailVerified,
  };
}
