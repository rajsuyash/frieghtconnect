"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { EnvelopeSimple, CheckCircle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Role = "shipper" | "forwarder";

function RegisterForm() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") === "forwarder" ? "forwarder" : "shipper";
  const [role, setRole] = React.useState<Role>(initialRole);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [verified, setVerified] = React.useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });
      if (res.status === 201) {
        const data = await res.json().catch(() => null);
        setVerified(Boolean(data?.verified));
        setDone(true);
      } else if (res.status === 409) {
        setError("An account with this email already exists.");
      } else {
        const data = await res.json().catch(() => null);
        setError(data?.message || "Please check your details and try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-verified-soft)] text-[var(--color-verified)]">
          <CheckCircle size={30} weight="fill" />
        </span>
        <h1 className="mt-5 text-xl font-semibold text-[var(--color-ink)]">
          {verified ? "Account created" : "Check your email"}
        </h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          {verified ? (
            <>
              Your account for <strong>{email}</strong> is ready. Sign in to
              continue.
            </>
          ) : (
            <>
              We sent a verification link to <strong>{email}</strong>. Confirm it
              to activate your account.
            </>
          )}
        </p>
        <Link href="/login" className="mt-6 inline-block">
          <Button>{verified ? "Sign in" : "Back to sign in"}</Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-ink)]">
          Create your account
        </h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Free to join. Forwarders can list a company after verifying.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 rounded-xl bg-[var(--color-canvas)] p-1">
        {(["shipper", "forwarder"] as Role[]).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className={`rounded-lg py-2 text-sm font-medium transition-colors cursor-pointer ${
              role === r
                ? "bg-white text-[var(--color-navy)] shadow-sm"
                : "text-[var(--color-faint)] hover:text-[var(--color-muted)]"
            }`}
          >
            {r === "shipper" ? "I'm a shipper" : "I'm a forwarder"}
          </button>
        ))}
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
        <Input id="password" type="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
        <p className="text-xs text-[var(--color-faint)]">
          Use 8+ characters with a letter and a number.
        </p>
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        <EnvelopeSimple size={18} weight="fill" />
        {loading ? "Creating account…" : "Create account"}
      </Button>

      <p className="text-center text-sm text-[var(--color-muted)]">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-[var(--color-accent)] hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}

export default function RegisterPage() {
  return (
    <React.Suspense fallback={<div className="h-96" />}>
      <RegisterForm />
    </React.Suspense>
  );
}
