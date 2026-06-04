import Link from "next/link";
import {
  Tray,
  PencilSimple,
  ArrowSquareOut,
  ShieldCheck,
  Clock,
  WarningCircle,
} from "@phosphor-icons/react/dist/ssr";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/guards";
import { getMyForwarder } from "@/lib/dashboard/queries";

export const metadata = { title: "Dashboard — Global Trade Collective" };

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft — not submitted",
  pending: "Pending review",
  approved: "Approved & live",
  rejected: "Changes requested",
  suspended: "Suspended",
};

// Per-request data (DB + session) — never prerender at build.
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (user?.role !== "forwarder") {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-[var(--color-ink)]">No forwarder dashboard</h1>
        <p className="mx-auto mt-2 max-w-md text-[var(--color-muted)]">
          The dashboard is for freight forwarders. Browse the directory to find and
          contact verified agents.
        </p>
        <Link href="/forwarders" className="mt-6 inline-block">
          <Button>Browse the directory</Button>
        </Link>
      </main>
    );
  }

  const f = await getMyForwarder(user.id);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight text-[var(--color-ink)]">
        {f ? f.companyName : "Welcome"}
      </h1>

      {!f ? (
        <div className="mt-6 rounded-3xl border border-[var(--color-line)] bg-white p-10 text-center">
          <h2 className="text-xl font-semibold text-[var(--color-ink)]">List your company</h2>
          <p className="mx-auto mt-2 max-w-md text-[var(--color-muted)]">
            Build your profile, upload verification documents, and submit for review
            to appear in the directory.
          </p>
          <Link href="/register/forwarder" className="mt-6 inline-block">
            <Button>Get started</Button>
          </Link>
        </div>
      ) : (
        <>
          {/* status */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-[var(--color-line)] bg-white p-6">
            <div className="flex items-center gap-3">
              {f.status === "approved" ? (
                <ShieldCheck size={28} weight="fill" className="text-[var(--color-verified)]" />
              ) : f.status === "pending" ? (
                <Clock size={28} weight="fill" className="text-[var(--color-accent)]" />
              ) : (
                <WarningCircle size={28} weight="fill" className="text-[var(--color-faint)]" />
              )}
              <div>
                <div className="font-semibold text-[var(--color-ink)]">
                  {STATUS_LABEL[f.status] ?? f.status}
                </div>
                {f.status === "rejected" && f.rejectionReason && (
                  <div className="mt-0.5 text-sm text-amber-700">{f.rejectionReason}</div>
                )}
              </div>
            </div>
            {f.status === "approved" && (
              <Link href={`/forwarders/${f.slug}`} className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-accent)] hover:underline">
                View public profile
                <ArrowSquareOut size={15} />
              </Link>
            )}
          </div>

          {/* quick stats + actions */}
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <Link href="/dashboard/inquiries" className="group rounded-3xl border border-[var(--color-line)] bg-white p-7 transition-colors hover:border-[var(--color-accent)]">
              <Tray size={26} weight="duotone" className="text-[var(--color-accent)]" />
              <div className="mt-4 text-3xl font-bold text-[var(--color-ink)]">{f._count.inquiries}</div>
              <div className="mt-1 flex items-center gap-1 text-sm font-medium text-[var(--color-muted)]">
                {f._count.inquiries === 1 ? "inquiry received" : "inquiries received"}
                <span className="text-[var(--color-accent)] transition-transform group-hover:translate-x-0.5">→</span>
              </div>
            </Link>

            <Link href="/register/forwarder" className="group rounded-3xl border border-[var(--color-line)] bg-white p-7 transition-colors hover:border-[var(--color-accent)]">
              <PencilSimple size={26} weight="duotone" className="text-[var(--color-navy)]" />
              <div className="mt-4 font-semibold text-[var(--color-ink)]">Edit profile</div>
              <div className="mt-1 text-sm text-[var(--color-muted)]">
                Update coverage, modes, services, and documents.
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="neutral">{f._count.countries} countries</Badge>
                <Badge variant="neutral">{f._count.documents} documents</Badge>
                {f.verified && (
                  <Badge variant="verified">
                    <ShieldCheck size={12} weight="fill" />
                    Verified
                  </Badge>
                )}
              </div>
            </Link>
          </div>
        </>
      )}
    </main>
  );
}
