import { NextRequest, NextResponse } from "next/server";
import { retryQueuedInquiries } from "@/lib/inquiries/retry";

export const dynamic = "force-dynamic";

/**
 * Cron entry point: re-send notification emails for queued inquiries.
 * Protected by CRON_SECRET (Authorization: Bearer <secret>) so it can be hit
 * by Railway cron / an external scheduler but not by the public.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_DISABLED" }, { status: 503 });
  }
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const result = await retryQueuedInquiries();
  return NextResponse.json(result, { status: 200 });
}
