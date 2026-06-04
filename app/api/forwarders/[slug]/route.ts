import { NextResponse } from "next/server";
import { getForwarderBySlug } from "@/lib/forwarders/repository";

// GET /api/forwarders/:slug — public projection; 404 if unknown or not approved.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const forwarder = await getForwarderBySlug(slug);
  if (!forwarder) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  return NextResponse.json(forwarder);
}
