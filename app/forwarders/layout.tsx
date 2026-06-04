import Link from "next/link";
import { Boat } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";

export default function ForwardersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[100dvh] bg-[var(--color-canvas)]">
      <header className="sticky top-0 z-40 border-b border-[var(--color-line)] bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-navy)] text-white">
              <Boat size={20} weight="fill" />
            </span>
            <span className="font-[family-name:var(--font-heading)] text-lg font-semibold tracking-tight text-[var(--color-ink)]">
              Global Trade Collective
            </span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link
              href="/#for-forwarders"
              className="hidden rounded-full px-4 py-2 text-sm font-medium text-[var(--color-muted)] transition-colors hover:text-[var(--color-ink)] sm:block"
            >
              For forwarders
            </Link>
            <Link href="/register/forwarder">
              <Button size="sm">List your company</Button>
            </Link>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
