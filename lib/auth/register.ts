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

export async function registerUser(input: RegisterInput): Promise<{ id: string }> {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new EmailTakenError();

  const passwordHash = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: { email: input.email, passwordHash, role: input.role },
  });

  const token = await createVerificationToken(user.email);
  const link = `${appBaseUrl()}/verify-email?token=${token}`;
  await sendEmail({
    to: user.email,
    subject: "Verify your FreightConnect email",
    text: `Welcome to FreightConnect. Confirm your email address to finish setting up your account:\n\n${link}\n\nThis link expires in 24 hours.`,
  });

  return { id: user.id };
}
