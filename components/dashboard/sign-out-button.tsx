"use client";

import { useClerk } from "@clerk/nextjs";
import { SignOut } from "@phosphor-icons/react";

export function SignOutButton() {
  const { signOut } = useClerk();
  return (
    <button
      type="button"
      onClick={() => signOut({ redirectUrl: "/" })}
      className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-muted)] transition-colors hover:text-[var(--color-ink)] cursor-pointer"
    >
      <SignOut size={16} />
      Sign out
    </button>
  );
}
