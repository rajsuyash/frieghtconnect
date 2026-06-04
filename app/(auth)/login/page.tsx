"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { SignIn } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      // Generic message — never reveal whether the email exists (F6 AC5).
      setError("Invalid email or password.");
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-ink)]">Welcome back</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Sign in to manage your profile and inquiries.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-[var(--color-ink)]">
          Email
        </label>
        <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-[var(--color-ink)]">
          Password
        </label>
        <Input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" />
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        <SignIn size={18} weight="bold" />
        {loading ? "Signing in…" : "Sign in"}
      </Button>

      <p className="text-center text-sm text-[var(--color-muted)]">
        New to FreightConnect?{" "}
        <Link href="/register" className="font-medium text-[var(--color-accent)] hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div className="h-80" />}>
      <LoginForm />
    </React.Suspense>
  );
}
