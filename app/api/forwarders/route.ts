import { NextRequest, NextResponse } from "next/server";
import { directoryFilterSchema } from "@/lib/validation/forwarder";
import { queryForwarders } from "@/lib/forwarders/repository";

// GET /api/forwarders?country=&mode=&service=&port=&q=&page=&pageSize=
export async function GET(req: NextRequest) {
  const params = Object.fromEntries(req.nextUrl.searchParams.entries());
  const parsed = directoryFilterSchema.safeParse(params);

  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      { error: "INVALID_FILTER", field: first?.path.join(".") || undefined },
      { status: 400 },
    );
  }

  const data = await queryForwarders(parsed.data);
  return NextResponse.json(data);
}
