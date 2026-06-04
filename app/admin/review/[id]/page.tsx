import { notFound } from "next/navigation";
import Link from "next/link";
import { CaretLeft, FilePdf, DownloadSimple } from "@phosphor-icons/react/dist/ssr";
import { Monogram } from "@/components/brand/monogram";
import { Badge } from "@/components/ui/badge";
import { ModerationActions } from "@/components/admin/moderation-actions";
import { getApplication } from "@/lib/admin/moderation";
import { createSignedDocPath } from "@/lib/admin/signed-url";
import { modeLabel, serviceLabel } from "@/lib/taxonomy";
import { countryLabel } from "@/lib/geo";

export const metadata = { title: "Application review — Global Trade Collective Admin" };

function fmtKb(bytes: number): string {
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

// Per-request data (DB + session) — never prerender at build.
export const dynamic = "force-dynamic";

export default async function ApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const app = await getApplication(id);
  if (!app) notFound();

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <Link href="/admin/review" className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-muted)] transition-colors hover:text-[var(--color-accent)]">
        <CaretLeft size={14} weight="bold" />
        Back to queue
      </Link>

      <div className="mt-6 flex items-start gap-4 rounded-3xl border border-[var(--color-line)] bg-white p-7">
        <Monogram name={app.companyName} size={64} rounded="rounded-2xl" />
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--color-ink)]">{app.companyName}</h1>
            <Badge variant="neutral" size="md">{app.status}</Badge>
          </div>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            {countryLabel(app.primaryCountry)}
            {app.yearEstablished ? ` · since ${app.yearEstablished}` : ""} · {app.owner.email}
          </p>
          {app.websiteUrl && (
            <a href={app.websiteUrl} target="_blank" rel="noopener noreferrer nofollow" className="mt-1 inline-block text-sm text-[var(--color-accent)] hover:underline">
              {app.websiteUrl}
            </a>
          )}
          {app.about && <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--color-muted)]">{app.about}</p>}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* KYC documents */}
          <section className="rounded-3xl border border-[var(--color-line)] bg-white p-7">
            <h2 className="text-lg font-semibold text-[var(--color-ink)]">Verification documents</h2>
            {app.documents.length === 0 ? (
              <p className="mt-3 text-sm text-[var(--color-muted)]">No documents uploaded.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {app.documents.map((d) => (
                  <li key={d.id} className="flex items-center gap-3 rounded-xl border border-[var(--color-line)] px-4 py-3">
                    <FilePdf size={20} className="text-[var(--color-accent)]" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-[var(--color-ink)]">{d.type.replace(/_/g, " ")}</div>
                      <div className="text-xs text-[var(--color-faint)]">{d.mimeType} · {fmtKb(d.sizeBytes)}</div>
                    </div>
                    {/* short-lived signed link (expires in 5 min) */}
                    <a href={createSignedDocPath(d.id)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-full border border-[var(--color-line)] px-3 py-1.5 text-sm font-medium text-[var(--color-navy)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]">
                      <DownloadSimple size={15} />
                      View
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* coverage */}
          <section className="rounded-3xl border border-[var(--color-line)] bg-white p-7">
            <h2 className="text-lg font-semibold text-[var(--color-ink)]">Coverage</h2>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {app.countries.map((c, i) => (
                <li key={i} className="rounded-xl border border-[var(--color-line)] p-3 text-sm">
                  <span className="font-medium text-[var(--color-ink)]">{countryLabel(c.country)}</span>
                  {c.isHeadquarters && <Badge variant="accent" className="ml-2">HQ</Badge>}
                  {c.city && <span className="text-[var(--color-muted)]"> · {c.city}</span>}
                  {c.ports.length > 0 && <div className="mt-1 text-xs text-[var(--color-faint)]">Ports: {c.ports.join(", ")}</div>}
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              {app.modes.map((m) => (<Badge key={m} variant="neutral">{modeLabel(m)}</Badge>))}
              {app.services.map((s) => (<Badge key={s} variant="accent">{serviceLabel(s)}</Badge>))}
            </div>
          </section>
        </div>

        {/* decision */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl border border-[var(--color-line)] bg-white p-7">
            <h2 className="text-lg font-semibold text-[var(--color-ink)]">Decision</h2>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              Approving sets the verified badge and publishes the profile.
            </p>
            {app.rejectionReason && (
              <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
                Previous rejection: {app.rejectionReason}
              </p>
            )}
            <div className="mt-5">
              <ModerationActions id={app.id} status={app.status} />
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
