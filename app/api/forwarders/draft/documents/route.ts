import { NextResponse } from "next/server";
import type { KycType } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth/guards";
import { addKycDocument, NoDraftError } from "@/lib/forwarders/onboarding";
import { ALLOWED_KYC_TYPES, MAX_KYC_BYTES } from "@/lib/storage";

const KYC_TYPES = new Set<KycType>([
  "business_registration",
  "trade_license",
  "certificate",
  "other",
]);

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  if (user.role !== "forwarder")
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  const rawType = String(form?.get("type") || "business_registration");
  const type: KycType = KYC_TYPES.has(rawType as KycType)
    ? (rawType as KycType)
    : "business_registration";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "BAD_FILE" }, { status: 400 });
  }
  if (file.size > MAX_KYC_BYTES) {
    return NextResponse.json({ error: "FILE_TOO_LARGE" }, { status: 413 });
  }
  if (!ALLOWED_KYC_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "BAD_FILE", message: "Only PDF, JPG, or PNG files are accepted." },
      { status: 400 },
    );
  }

  const data = Buffer.from(await file.arrayBuffer());
  try {
    const doc = await addKycDocument(user.id, {
      filename: file.name,
      type,
      mimeType: file.type,
      data,
    });
    return NextResponse.json(doc, { status: 201 });
  } catch (err) {
    if (err instanceof NoDraftError) {
      return NextResponse.json({ error: "NO_DRAFT" }, { status: 400 });
    }
    throw err;
  }
}
