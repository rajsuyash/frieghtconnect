import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { createVerificationToken } from "@/lib/auth/tokens";
import { sendEmail, appBaseUrl } from "@/lib/email";
import type { RegisterInput } from "@/lib/validation/auth";

export class EmailTakenError extends Error {
  constructor() {
    super("EMAIL_TAKEN");
    this.name = "EmailTakenError";
  }
}

export async function registerUser(
  input: RegisterInput,
): Promise<{ id: string; verified: boolean }> {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new EmailTakenError();

  // Demo mode: until Resend is wired, verification emails can't be received, so
  // auto-verify lets the full forwarder flow be demoed. Remove DEMO_AUTOVERIFY
  // once real email is configured.
  const autoVerify = process.env.DEMO_AUTOVERIFY === "true";

  const passwordHash = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      role: input.role,
      emailVerified: autoVerify,
    },
  });

  if (!autoVerify) {
    const token = await createVerificationToken(user.email);
    const link = `${appBaseUrl()}/verify-email?token=${token}`;
    await sendEmail({
      to: user.email,
      subject: "Verify your Global Trade Collective email",
      text: `Welcome to Global Trade Collective. Confirm your email address to finish setting up your account:\n\n${link}\n\nThis link expires in 24 hours.`,
    });
  }

  return { id: user.id, verified: autoVerify };
}
