import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { syncCurrentUser } from "@/lib/auth/sync";

export interface SessionUser {
  id: string;
  email?: string | null;
  role: Role;
  isVerified: boolean;
}

/** Current DB user (synced from Clerk) or null — safe in Route Handlers + Server Components. */
export async function getCurrentUser(): Promise<SessionUser | null> {
  return syncCurrentUser();
}

/** Page-level guard: redirect to Clerk sign-in if signed out. */
export async function requireUser(next?: string): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/sign-in${next ? `?redirect_url=${encodeURIComponent(next)}` : ""}`);
  }
  return user;
}

/** Page-level guard: redirect away if the role doesn't match. */
export async function requireRole(role: Role, next?: string): Promise<SessionUser> {
  const user = await requireUser(next);
  if (user.role !== role) redirect("/");
  return user;
}
