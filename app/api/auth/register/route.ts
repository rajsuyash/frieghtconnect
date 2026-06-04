import { NextResponse } from "next/server";
import { registerSchema } from "@/lib/validation/auth";
import { registerUser, EmailTakenError } from "@/lib/auth/register";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      { error: "INVALID_INPUT", field: first?.path.join(".") || undefined, message: first?.message },
      { status: 400 },
    );
  }

  try {
    const { id, verified } = await registerUser(parsed.data);
    return NextResponse.json({ id, status: "created", verified }, { status: 201 });
  } catch (err) {
    if (err instanceof EmailTakenError) {
      return NextResponse.json({ error: "EMAIL_TAKEN" }, { status: 409 });
    }
    throw err;
  }
}
