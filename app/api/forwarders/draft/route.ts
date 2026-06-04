import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/guards";
import { forwarderDraftSchema } from "@/lib/validation/forwarder";
import { saveDraft } from "@/lib/forwarders/onboarding";

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
