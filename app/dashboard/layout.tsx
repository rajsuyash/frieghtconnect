import Link from "next/link";
import { Boat } from "@phosphor-icons/react/dist/ssr";
import { requireUser } from "@/lib/auth/guards";
import { SignOutButton } from "@/components/dashboard/sign-out-button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser("/dashboard");

  return (
    <div className="min-h-[100dvh] bg-[var(--color-canvas)]">
      <header className="sticky top-0 z-40 border-b border-[var(--color-line)] bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-navy)] text-white">
              <Boat size={20} weight="fill" />
            </span>
            <span className="font-[family-name:var(--font-heading)] text-lg font-semibold tracking-tight text-[var(--color-ink)]">
              Global Trade Collective
            </span>
          </Link>
          <nav className="flex items-center gap-5">
            <Link href="/dashboard" className="hidden text-sm font-medium text-[var(--color-muted)] transition-colors hover:text-[var(--color-ink)] sm:block">
              Overview
            </Link>
            <Link href="/dashboard/inquiries" className="hidden text-sm font-medium text-[var(--color-muted)] transition-colors hover:text-[var(--color-ink)] sm:block">
              Inquiries
            </Link>
            <SignOutButton />
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
