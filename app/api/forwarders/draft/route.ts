import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/guards";
import { forwarderDraftSchema } from "@/lib/validation/forwarder";
import { saveDraft } from "@/lib/forwarders/onboarding";
import { prisma } from "@/lib/db";

// Return the owner's current draft so the onboarding wizard can prefill for edits.
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  if (user.role !== "forwarder")
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const f = await prisma.forwarderProfile.findUnique({
    where: { ownerUserId: user.id },
    select: {
      companyName: true,
      primaryCountry: true,
      yearEstablished: true,
      websiteUrl: true,
      about: true,
      modes: true,
      services: true,
      status: true,
      countries: { select: { country: true, city: true, isHeadquarters: true } },
    },
  });
  return NextResponse.json(f);
}

async function handle(req: Request, createdStatus: number) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }
  if (user.role !== "forwarder") {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = forwarderDraftSchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      { error: "MISSING_FIELD", field: first?.path.join(".") || undefined },
      { status: 400 },
    );
  }

  const draft = await saveDraft(user.id, parsed.data);
  return NextResponse.json(draft, { status: createdStatus });
}

export const POST = (req: Request) => handle(req, 201);
export const PATCH = (req: Request) => handle(req, 200);
