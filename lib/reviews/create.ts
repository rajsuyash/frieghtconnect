import { prisma } from "@/lib/db";
import type { ReviewInput } from "@/lib/validation/review";

export class InquiryNotFoundError extends Error {
  constructor() {
    super("INQUIRY_NOT_FOUND");
    this.name = "InquiryNotFoundError";
  }
}
export class ReviewerMismatchError extends Error {
  constructor() {
    super("FORBIDDEN");
    this.name = "ReviewerMismatchError";
  }
}
export class AlreadyReviewedError extends Error {
  constructor() {
    super("ALREADY_REVIEWED");
    this.name = "AlreadyReviewedError";
  }
}

export interface ReviewResult {
  id: string;
  status: string;
}

/**
 * Create a review for the forwarder an inquiry was sent to. Verifies the
 * reviewer actually transacted: the submitted email must match the inquiry's
 * shipperEmail. One review per inquiry (DB-unique on inquiryId). New reviews
 * are "pending" until an admin moderates them (F5) — never instantly public.
 */
export async function createReview(input: ReviewInput): Promise<ReviewResult> {
  const inquiry = await prisma.inquiry.findUnique({
    where: { id: input.inquiryId },
    select: { id: true, forwarderId: true, shipperEmail: true },
  });
  if (!inquiry) throw new InquiryNotFoundError();
  if (
    inquiry.shipperEmail.toLowerCase() !== input.shipperEmail.toLowerCase()
  ) {
    throw new ReviewerMismatchError();
  }

  const existing = await prisma.review.findUnique({
    where: { inquiryId: inquiry.id },
    select: { id: true },
  });
  if (existing) throw new AlreadyReviewedError();

  const review = await prisma.review.create({
    data: {
      forwarderId: inquiry.forwarderId,
      inquiryId: inquiry.id,
      rating: input.rating,
      comment: input.comment || null,
      status: "pending",
    },
    select: { id: true, status: true },
  });
  return review;
}
