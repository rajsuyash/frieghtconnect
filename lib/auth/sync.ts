import { auth, currentUser } from "@clerk/nextjs/server";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/db";

export interface DbSessionUser {
  id: string;
  email: string | null;
  role: Role;
  isVerified: boolean;
}

/**
 * Map the Clerk session to our DB User (the source of truth for role + ownership).
 * Finds by clerkId, else links a pre-existing row by email (seed/admin), else
 * creates a shipper. Keeps the verified flag in sync. Returns null if signed out.
 */
export async function syncCurrentUser(): Promise<DbSessionUser | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const cu = await currentUser();
  const email =
    cu?.primaryEmailAddress?.emailAddress ??
    cu?.emailAddresses?.[0]?.emailAddress ??
    null;
  const verified =
    cu?.primaryEmailAddress?.verification?.status === "verified" ||
    (cu?.emailAddresses?.some((e) => e.verification?.status === "verified") ??
      false);

  let user = await prisma.user.findUnique({ where: { clerkId: userId } });

  if (!user && email) {
    const byEmail = await prisma.user.findUnique({ where: { email } });
    if (byEmail) {
      user = await prisma.user.update({
        where: { id: byEmail.id },
        data: { clerkId: userId, emailVerified: verified },
      });
    }
  }

  if (!user) {
    try {
      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email: email ?? `${userId}@clerk.local`,
          role: "shipper",
          emailVerified: verified,
        },
      });
    } catch {
      // race: another request created it first
      user = await prisma.user.findUnique({ where: { clerkId: userId } });
    }
  } else if (user.emailVerified !== verified) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: verified },
    });
  }

  if (!user) return null;
  return { id: user.id, email: user.email, role: user.role, isVerified: user.emailVerified };
}

/** Upgrade a shipper to forwarder (one-way) — called when they start "List your company". */
export async function promoteToForwarder(userId: string): Promise<void> {
  const u = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (u?.role === "shipper") {
    await prisma.user.update({ where: { id: userId }, data: { role: "forwarder" } });
  }
}
