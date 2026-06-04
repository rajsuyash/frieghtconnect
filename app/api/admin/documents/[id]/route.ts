import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/guards";
import { verifyDocSignature } from "@/lib/admin/signed-url";
import { getKycObject } from "@/lib/storage";
import { prisma } from "@/lib/db";

// Private KYC download. Requires BOTH an admin session AND a valid, unexpired
// signature. Documents are never reachable without a freshly signed link.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const { id } = await params;
  const exp = req.nextUrl.searchParams.get("exp");
  const sig = req.nextUrl.searchParams.get("sig");
  if (!verifyDocSignature(id, exp, sig)) {
    return NextResponse.json({ error: "INVALID_OR_EXPIRED" }, { status: 403 });
  }

  const doc = await prisma.kycDocument.findUnique({
    where: { id },
    select: { storageKey: true, mimeType: true },
  });
  if (!doc) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  const data = await getKycObject(doc.storageKey);
  return new NextResponse(new Uint8Array(data), {
    status: 200,
    headers: {
      "Content-Type": doc.mimeType,
      "Content-Disposition": "inline",
      "Cache-Control": "private, no-store",
    },
  });
}
