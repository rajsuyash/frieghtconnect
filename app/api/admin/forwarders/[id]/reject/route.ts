import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/guards";
import {
  rejectForwarder,
  ReasonRequiredError,
  InvalidTransitionError,
  NotFoundError,
} from "@/lib/admin/moderation";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  try {
    return NextResponse.json(
      await rejectForwarder(user.id, id, String(body?.reason ?? "")),
      { status: 200 },
    );
  } catch (err) {
    if (err instanceof ReasonRequiredError)
      return NextResponse.json({ error: "REASON_REQUIRED" }, { status: 400 });
    if (err instanceof NotFoundError)
      return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    if (err instanceof InvalidTransitionError)
      return NextResponse.json({ error: "INVALID_TRANSITION" }, { status: 409 });
    throw err;
  }
}
