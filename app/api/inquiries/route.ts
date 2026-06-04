import { NextRequest, NextResponse } from "next/server";
import { inquirySchema } from "@/lib/validation/inquiry";
import { createInquiry, ForwarderNotAvailableError } from "@/lib/inquiries/create";
import { rateLimit } from "@/lib/rate-limit";

const MAX_PER_MINUTE = 5;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  // Honeypot: real users never fill this. Pretend success, drop silently.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ id: "ok", status: "sent" }, { status: 201 });
  }

  const parsed = inquirySchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      { error: "MISSING_FIELD", field: first?.path.join(".") || undefined },
      { status: 400 },
    );
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const key = `inquiry:${ip}:${parsed.data.shipperEmail.toLowerCase()}`;
  if (!rateLimit(key, MAX_PER_MINUTE, 60_000)) {
    return NextResponse.json({ error: "RATE_LIMITED" }, { status: 429 });
  }

  try {
    const result = await createInquiry(parsed.data);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    if (err instanceof ForwarderNotAvailableError) {
      return NextResponse.json(
        { error: "FORWARDER_NOT_AVAILABLE" },
        { status: 404 },
      );
    }
    throw err;
  }
}
