import Link from "next/link";
import { ArrowRight, FileText, MapPin } from "@phosphor-icons/react/dist/ssr";
import { Monogram } from "@/components/brand/monogram";
import { Badge } from "@/components/ui/badge";
import { listPending } from "@/lib/admin/moderation";
import { countryLabel } from "@/lib/geo";

export const metadata = { title: "Review queue — FreightConnect Admin" };

export default async function ReviewQueuePage() {
  const pending = await listPending();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight text-[var(--color-ink)]">
        Review queue
      </h1>
      <p className="mt-2 text-[var(--color-muted)]">
        {pending.length} {pending.length === 1 ? "application" : "applications"} awaiting review.
      </p>

      {pending.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-[var(--color-line)] bg-white py-16 text-center text-[var(--color-muted)]">
          Nothing in the queue. New submissions appear here.
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {pending.map((p) => (
            <li key={p.id}>
              <Link
                href={`/admin/review/${p.id}`}
                className="flex items-center gap-4 rounded-2xl border border-[var(--color-line)] bg-white p-5 transition-colors hover:border-[var(--color-accent)]"
              >
                <Monogram name={p.companyName} size={48} />
                <div className="flex-1">
                  <div className="font-semibold text-[var(--color-ink)]">{p.companyName}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--color-muted)]">
                    <span className="flex items-center gap-1.5">
                      <MapPin size={14} weight="fill" className="text-[var(--color-faint)]" />
                      {countryLabel(p.primaryCountry)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FileText size={14} weight="fill" className="text-[var(--color-faint)]" />
                      {p._count.documents} {p._count.documents === 1 ? "document" : "documents"}
                    </span>
                    <span>{p._count.countries} {p._count.countries === 1 ? "country" : "countries"}</span>
                  </div>
                </div>
                <Badge variant="neutral" size="md">Pending</Badge>
                <ArrowRight size={18} className="text-[var(--color-faint)]" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
