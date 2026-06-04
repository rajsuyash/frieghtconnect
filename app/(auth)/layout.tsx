import Link from "next/link";
import { Boat } from "@phosphor-icons/react/dist/ssr";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[linear-gradient(180deg,#ffffff_0%,#eef4fc_100%)] px-4 py-12">
      <Link href="/" className="mb-8 flex items-center gap-2.5">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-navy)] text-white">
          <Boat size={22} weight="fill" />
        </span>
        <span className="font-[family-name:var(--font-heading)] text-xl font-semibold tracking-tight text-[var(--color-ink)]">
          Global Trade Collective
        </span>
      </Link>
      <div className="w-full max-w-md rounded-3xl border border-[var(--color-line)] bg-white p-8 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.3)]">
        {children}
      </div>
    </div>
  );
}
