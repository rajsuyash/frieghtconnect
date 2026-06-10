import Link from "next/link";
import { Star } from "@phosphor-icons/react/dist/ssr";
import { getApprovedReviews, getReviewAggregate } from "@/lib/reviews/queries";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5 text-[var(--color-accent)]" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={15} weight={rating >= n ? "fill" : "regular"} />
      ))}
    </span>
  );
}

/** Approved reviews + aggregate for a public profile (server component). */
export async function ReviewsSection({
  forwarderId,
  slug,
  company,
}: {
  forwarderId: string;
  slug: string;
  company: string;
}) {
  const [aggregate, reviews] = await Promise.all([
    getReviewAggregate(forwarderId),
    getApprovedReviews(forwarderId),
  ]);

  return (
    <section
      className="mt-6 rounded-3xl border border-[var(--color-line)] bg-white p-7"
      data-testid="reviews-section"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-[var(--color-ink)]">Reviews</h2>
          {aggregate.average !== null && (
            <span className="flex items-center gap-2 text-sm text-[var(--color-muted)]" data-testid="review-aggregate">
              <Stars rating={Math.round(aggregate.average)} />
              <strong className="text-[var(--color-ink)]">{aggregate.average}</strong>
              ({aggregate.count} review{aggregate.count === 1 ? "" : "s"})
            </span>
          )}
        </div>
        <Link
          href={`/forwarders/${slug}/review`}
          className="text-sm font-medium text-[var(--color-accent)] hover:underline"
        >
          Worked with {company}? Leave a review
        </Link>
      </div>

      {reviews.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--color-muted)]">
          No reviews yet. Reviews are tied to real inquiries and checked before
          they go live.
        </p>
      ) : (
        <ul className="mt-5 grid gap-4 sm:grid-cols-2">
          {reviews.map((r) => (
            <li key={r.id} className="rounded-2xl border border-[var(--color-line)] p-4">
              <div className="flex items-center justify-between gap-2">
                <Stars rating={r.rating} />
                <span className="text-xs text-[var(--color-faint)]">
                  {r.createdAt.toISOString().slice(0, 10)}
                </span>
              </div>
              {r.comment && (
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
                  {r.comment}
                </p>
              )}
              <p className="mt-2 text-xs font-medium text-[var(--color-faint)]">
                {r.reviewerName}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
