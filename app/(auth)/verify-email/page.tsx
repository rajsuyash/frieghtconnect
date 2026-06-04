import Link from "next/link";
import { CheckCircle, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { consumeVerificationToken } from "@/lib/auth/tokens";

export const metadata = { title: "Verify email — FreightConnect" };

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const result = token
    ? await consumeVerificationToken(token)
    : ({ ok: false, reason: "invalid" } as const);

  if (result.ok) {
    return (
      <div className="text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-verified-soft)] text-[var(--color-verified)]">
          <CheckCircle size={30} weight="fill" />
        </span>
        <h1 className="mt-5 text-xl font-semibold text-[var(--color-ink)]">
          Email verified
        </h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Your account is active. You can sign in now.
        </p>
        <Link href="/login" className="mt-6 inline-block">
          <Button>Sign in</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
        <WarningCircle size={30} weight="fill" />
      </span>
      <h1 className="mt-5 text-xl font-semibold text-[var(--color-ink)]">
        {result.reason === "expired" ? "Link expired" : "Invalid link"}
      </h1>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        {result.reason === "expired"
          ? "This verification link has expired. Sign in to request a new one."
          : "This verification link is not valid. It may have already been used."}
      </p>
      <Link href="/login" className="mt-6 inline-block">
        <Button variant="secondary">Back to sign in</Button>
      </Link>
    </div>
  );
}
