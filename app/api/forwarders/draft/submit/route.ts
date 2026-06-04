import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/guards";
import {
  submitForReview,
  NoDraftError,
  NotVerifiedError,
  IncompleteError,
} from "@/lib/forwarders/onboarding";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  if (user.role !== "forwarder")
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  try {
    const result = await submitForReview(user.id);
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    if (err instanceof NotVerifiedError) {
      return NextResponse.json({ error: "EMAIL_NOT_VERIFIED" }, { status: 403 });
    }
    if (err instanceof IncompleteError) {
      return NextResponse.json(
        { error: "INCOMPLETE", missing: err.missing },
        { status: 400 },
      );
    }
    if (err instanceof NoDraftError) {
      return NextResponse.json({ error: "NO_DRAFT" }, { status: 400 });
    }
    throw err;
  }
}
