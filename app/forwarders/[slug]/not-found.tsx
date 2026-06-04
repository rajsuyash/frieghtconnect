import Link from "next/link";
import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";

export default function ForwarderNotFound() {
  return (
    <main className="mx-auto flex max-w-xl flex-col items-center px-4 py-28 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-[var(--color-faint)]">
        <MagnifyingGlass size={30} />
      </span>
      <h1 className="mt-6 text-2xl font-bold text-[var(--color-ink)]">
        Forwarder not found
      </h1>
      <p className="mt-2 text-[var(--color-muted)]">
        This profile does not exist, or it has not been approved yet. Browse the
        verified directory instead.
      </p>
      <Link href="/forwarders" className="mt-6">
        <Button>Browse the directory</Button>
      </Link>
    </main>
  );
}
