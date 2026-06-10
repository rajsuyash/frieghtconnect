import Link from "next/link";
import { Star } from "@phosphor-icons/react/dist/ssr";
import { ReviewModerationActions } from "@/components/admin/review-moderation-actions";
import { listPendingReviews } from "@/lib/reviews/queries";

export const metadata = { title: "Review moderation — Global Trade Collective Admin" };

// Per-request data (DB + session) — never prerender at build.
export const dynamic = "force-dynamic";

export default async function ReviewModerationPage() {
  const pending = await listPendingReviews();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight text-[var(--color-ink)]">
        Shipper reviews
      </h1>
      <p className="mt-2 text-[var(--color-muted)]">
        {pending.length} {pending.length === 1 ? "review" : "reviews"} awaiting
        moderation. Approved reviews appear on the forwarder&apos;s public profile.
      </p>

      {pending.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-[var(--color-line)] bg-white py-16 text-center text-[var(--color-muted)]">
          Nothing to moderate. New shipper reviews appear here.
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {pending.map((r) => (
            <li
              key={r.id}
              className="rounded-2xl border border-[var(--color-line)] bg-white p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex gap-0.5 text-[var(--color-accent)]">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} size={15} weight={r.rating >= n ? "fill" : "regular"} />
                    ))}
                  </span>
                  <Link
                    href={`/forwarders/${r.forwarder.slug}`}
                    className="font-semibold text-[var(--color-ink)] hover:text-[var(--color-accent)]"
                  >
                    {r.forwarder.companyName}
                  </Link>
                </div>
                <ReviewModerationActions reviewId={r.id} />
              </div>
              {r.comment && (
                <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">
                  {r.comment}
                </p>
              )}
              <p className="mt-3 text-xs text-[var(--color-faint)]">
                By {r.inquiry.shipperName} ({r.inquiry.shipperEmail}) ·{" "}
                {r.createdAt.toISOString().slice(0, 10)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
