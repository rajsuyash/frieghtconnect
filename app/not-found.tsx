import Link from "next/link";
import { Compass } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-xl flex-col items-center px-4 py-28 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-[var(--color-faint)]">
        <Compass size={30} />
      </span>
      <h1 className="mt-6 text-2xl font-bold text-[var(--color-ink)]">
        Page not found
      </h1>
      <p className="mt-2 text-[var(--color-muted)]">
        The page you are looking for does not exist or has moved.
      </p>
      <Link href="/" className="mt-6">
        <Button>Back to home</Button>
      </Link>
    </main>
  );
}
