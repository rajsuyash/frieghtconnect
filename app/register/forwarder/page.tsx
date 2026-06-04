import Link from "next/link";
import { Boat } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/guards";
import { promoteToForwarder } from "@/lib/auth/sync";
import { OnboardingWizard } from "@/components/forwarders/onboarding-wizard";

export const metadata = { title: "List your company — Global Trade Collective" };

// Per-request data (DB + session) — never prerender at build.
export const dynamic = "force-dynamic";

export default async function ForwarderOnboardingPage() {
  const user = await requireUser("/register/forwarder");
  // Reaching this page is the intent to list a company — promote shippers.
  if (user.role === "shipper") await promoteToForwarder(user.id);

  return (
    <div className="min-h-[100dvh] bg-[var(--color-canvas)]">
      <header className="sticky top-0 z-40 border-b border-[var(--color-line)] bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-navy)] text-white">
              <Boat size={20} weight="fill" />
            </span>
            <span className="font-[family-name:var(--font-heading)] text-lg font-semibold tracking-tight text-[var(--color-ink)]">
              Global Trade Collective
            </span>
          </Link>
          <Link
            href="/forwarders"
            className="text-sm font-medium text-[var(--color-muted)] transition-colors hover:text-[var(--color-ink)]"
          >
            Browse directory
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-[var(--color-ink)] md:text-4xl">
            List your company
          </h1>
          <p className="mt-2 text-[var(--color-muted)]">
            Build your profile, upload verification documents, and submit for
            review. Approved profiles appear in the directory with a verified badge.
          </p>
        </div>

        <div className="mt-8">
          {user.role === "admin" ? (
            <div className="rounded-3xl border border-[var(--color-line)] bg-white p-10 text-center">
              <h2 className="text-xl font-semibold text-[var(--color-ink)]">
                You&apos;re signed in as an admin
              </h2>
              <p className="mx-auto mt-2 max-w-md text-[var(--color-muted)]">
                Admin accounts review applications. Use a separate account to list a
                company.
              </p>
              <Link href="/admin/review" className="mt-6 inline-block">
                <Button>Go to review queue</Button>
              </Link>
            </div>
          ) : (
            <OnboardingWizard isVerified={user.isVerified} />
          )}
        </div>
      </main>
    </div>
  );
}
