import { NextRequest, NextResponse } from "next/server";
import { reviewSchema } from "@/lib/validation/review";
import {
  createReview,
  AlreadyReviewedError,
  InquiryNotFoundError,
  ReviewerMismatchError,
} from "@/lib/reviews/create";
import { rateLimit } from "@/lib/rate-limit";

const MAX_PER_MINUTE = 5;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  // Honeypot: real users never fill this. Pretend success, drop silently.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ id: "ok", status: "pending" }, { status: 201 });
  }

  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      { error: "MISSING_FIELD", field: first?.path.join(".") || undefined },
      { status: 400 },
    );
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const key = `review:${ip}:${parsed.data.shipperEmail.toLowerCase()}`;
  if (!rateLimit(key, MAX_PER_MINUTE, 60_000)) {
    return NextResponse.json({ error: "RATE_LIMITED" }, { status: 429 });
  }

  try {
    const result = await createReview(parsed.data);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    if (err instanceof InquiryNotFoundError)
      return NextResponse.json({ error: "INQUIRY_NOT_FOUND" }, { status: 404 });
    if (err instanceof ReviewerMismatchError)
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    if (err instanceof AlreadyReviewedError)
      return NextResponse.json({ error: "ALREADY_REVIEWED" }, { status: 409 });
    throw err;
  }
}
