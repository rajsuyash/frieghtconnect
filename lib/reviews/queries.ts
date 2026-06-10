import { prisma } from "@/lib/db";

export interface PublicReview {
  id: string;
  rating: number;
  comment: string | null;
  reviewerName: string;
  createdAt: Date;
}

export interface ReviewAggregate {
  count: number;
  average: number | null; // null when no approved reviews
}

/** First name + last initial — never the shipper's email or full identity. */
function publicReviewerName(shipperName: string): string {
  const [first = "Shipper", last] = shipperName.trim().split(/\s+/);
  return last ? `${first} ${last[0].toUpperCase()}.` : first;
}

/** Approved reviews for a public profile — whitelisted projection only. */
export async function getApprovedReviews(
  forwarderId: string,
  limit = 20,
): Promise<PublicReview[]> {
  const rows = await prisma.review.findMany({
    where: { forwarderId, status: "approved" },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      inquiry: { select: { shipperName: true } },
    },
  });
  return rows.map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    reviewerName: publicReviewerName(r.inquiry.shipperName),
    createdAt: r.createdAt,
  }));
}

/** Average + count over approved reviews only. */
export async function getReviewAggregate(
  forwarderId: string,
): Promise<ReviewAggregate> {
  const agg = await prisma.review.aggregate({
    where: { forwarderId, status: "approved" },
    _avg: { rating: true },
    _count: true,
  });
  return {
    count: agg._count,
    average: agg._avg.rating ? Math.round(agg._avg.rating * 10) / 10 : null,
  };
}

/** Moderation queue — admin only callers. */
export async function listPendingReviews() {
  return prisma.review.findMany({
    where: { status: "pending" },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      forwarder: { select: { companyName: true, slug: true } },
      inquiry: { select: { shipperName: true, shipperEmail: true } },
    },
  });
}
