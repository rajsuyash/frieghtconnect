import Link from "next/link";
import { ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import { requireRole } from "@/lib/auth/guards";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side admin gate on EVERY /admin/* page (F5 AC4).
  await requireRole("admin", "/admin/review");

  return (
    <div className="min-h-[100dvh] bg-[var(--color-canvas)]">
      <header className="sticky top-0 z-40 border-b border-[var(--color-line)] bg-[var(--color-navy)] text-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/admin/review" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
              <ShieldCheck size={20} weight="fill" className="text-emerald-400" />
            </span>
            <span className="font-[family-name:var(--font-heading)] text-lg font-semibold tracking-tight">
              Global Trade Collective Admin
            </span>
          </Link>
          <Link href="/forwarders" className="text-sm font-medium text-white/70 transition-colors hover:text-white">
            View directory
          </Link>
        </div>
      </header>
      {children}
    </div>
  );
}
