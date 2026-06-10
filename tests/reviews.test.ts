import { describe, it, expect, afterAll, beforeEach } from "vitest";

import { prisma } from "@/lib/db";
import {
  createReview,
  AlreadyReviewedError,
  InquiryNotFoundError,
  ReviewerMismatchError,
} from "@/lib/reviews/create";
import { approveReview, rejectReview } from "@/lib/reviews/moderation";
import { getApprovedReviews, getReviewAggregate } from "@/lib/reviews/queries";
import { reviewSchema } from "@/lib/validation/review";

const APPROVED_SLUG = "meridian-shipping-rotterdam-nl";
const SHIPPER = "zzreview@test.example";

async function forwarderId(): Promise<string> {
  const f = await prisma.forwarderProfile.findFirstOrThrow({
    where: { slug: APPROVED_SLUG },
    select: { id: true },
  });
  return f.id;
}

async function createInquiryRow(): Promise<string> {
  const row = await prisma.inquiry.create({
    data: {
      forwarderId: await forwarderId(),
      shipperName: "Rita Reviewer",
      shipperEmail: SHIPPER,
      message: "Inquiry for review test.",
      status: "sent",
    },
    select: { id: true },
  });
  return row.id;
}

async function adminId(): Promise<string> {
  const admin = await prisma.user.findFirstOrThrow({
    where: { role: "admin" },
    select: { id: true },
  });
  return admin.id;
}

async function cleanup() {
  await prisma.review.deleteMany({
    where: { inquiry: { shipperEmail: SHIPPER } },
  });
  await prisma.inquiry.deleteMany({ where: { shipperEmail: SHIPPER } });
}

beforeEach(cleanup);

afterAll(async () => {
  await cleanup();
  await prisma.$disconnect();
});

describe("reviewSchema", () => {
  it("rejects out-of-range ratings", () => {
    const base = { inquiryId: "x", shipperEmail: "a@b.co" };
    expect(reviewSchema.safeParse({ ...base, rating: 0 }).success).toBe(false);
    expect(reviewSchema.safeParse({ ...base, rating: 6 }).success).toBe(false);
    expect(reviewSchema.safeParse({ ...base, rating: 4 }).success).toBe(true);
  });
});

describe("createReview", () => {
  it("persists a pending review for a matching inquiry email", async () => {
    const inquiryId = await createInquiryRow();
    const res = await createReview({
      inquiryId,
      shipperEmail: SHIPPER.toUpperCase(), // case-insensitive match
      rating: 4,
      comment: "Great communication.",
    });
    expect(res.status).toBe("pending");
    const row = await prisma.review.findUnique({ where: { id: res.id } });
    expect(row?.rating).toBe(4);
    expect(row?.status).toBe("pending");
  });

  it("rejects a mismatched reviewer email", async () => {
    const inquiryId = await createInquiryRow();
    await expect(
      createReview({ inquiryId, shipperEmail: "stranger@evil.example", rating: 5 }),
    ).rejects.toBeInstanceOf(ReviewerMismatchError);
  });

  it("rejects an unknown inquiry", async () => {
    await expect(
      createReview({ inquiryId: "no-such-inquiry", shipperEmail: SHIPPER, rating: 5 }),
    ).rejects.toBeInstanceOf(InquiryNotFoundError);
  });

  it("allows only one review per inquiry", async () => {
    const inquiryId = await createInquiryRow();
    await createReview({ inquiryId, shipperEmail: SHIPPER, rating: 5 });
    await expect(
      createReview({ inquiryId, shipperEmail: SHIPPER, rating: 1 }),
    ).rejects.toBeInstanceOf(AlreadyReviewedError);
  });
});

describe("moderation + public projection", () => {
  it("only approved reviews are public and counted in the aggregate", async () => {
    const fid = await forwarderId();
    const admin = await adminId();

    const a = await createReview({
      inquiryId: await createInquiryRow(),
      shipperEmail: SHIPPER,
      rating: 5,
      comment: "Approved one",
    });
    const b = await createReview({
      inquiryId: await createInquiryRow(),
      shipperEmail: SHIPPER,
      rating: 1,
      comment: "Rejected one",
    });

    // Pending reviews are not public.
    expect((await getApprovedReviews(fid)).find((r) => r.id === a.id)).toBeUndefined();

    await approveReview(admin, a.id);
    await rejectReview(admin, b.id);

    const publicReviews = await getApprovedReviews(fid);
    expect(publicReviews.find((r) => r.id === a.id)).toBeDefined();
    expect(publicReviews.find((r) => r.id === b.id)).toBeUndefined();
    // Public projection masks the reviewer (no email, abbreviated name).
    const mine = publicReviews.find((r) => r.id === a.id)!;
    expect(mine.reviewerName).toBe("Rita R.");

    const agg = await getReviewAggregate(fid);
    expect(agg.count).toBeGreaterThanOrEqual(1);
    expect(agg.average).not.toBeNull();
  });
});
