"use client";

import { useEffect } from "react";
import { Warning } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Surfaced server-side via Next's error logging; digest links the two.
    console.error("App error boundary", error.digest ?? error.message);
  }, [error]);

  return (
    <main className="mx-auto flex max-w-xl flex-col items-center px-4 py-28 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-[var(--color-faint)]">
        <Warning size={30} />
      </span>
      <h1 className="mt-6 text-2xl font-bold text-[var(--color-ink)]">
        Something went wrong
      </h1>
      <p className="mt-2 text-[var(--color-muted)]">
        An unexpected error occurred. Please try again — if it keeps happening,
        contact support.
      </p>
      <Button className="mt-6" onClick={reset}>
        Try again
      </Button>
    </main>
  );
}
