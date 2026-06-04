import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { auth } from "@/auth";

export interface SessionUser {
  id: string;
  email?: string | null;
  role: Role;
  isVerified: boolean;
}

/** Current user or null — safe in both Route Handlers and Server Components. */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return {
    id: session.user.id,
    email: session.user.email,
    role: session.user.role,
    isVerified: session.user.isVerified,
  };
}

/** Page-level guard: redirect to /login if signed out. */
export async function requireUser(next?: string): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`);
  }
  return user;
}

/** Page-level guard: redirect away if the role doesn't match. */
export async function requireRole(role: Role, next?: string): Promise<SessionUser> {
  const user = await requireUser(next);
  if (user.role !== role) redirect("/");
  return user;
}
