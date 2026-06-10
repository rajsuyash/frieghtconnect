import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/guards";
import { NotFoundError } from "@/lib/admin/moderation";
import { approveReview } from "@/lib/reviews/moderation";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  const { id } = await params;
  try {
    return NextResponse.json(await approveReview(user.id, id), { status: 200 });
  } catch (err) {
    if (err instanceof NotFoundError)
      return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    throw err;
  }
}
