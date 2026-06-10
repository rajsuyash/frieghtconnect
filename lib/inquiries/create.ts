import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import {
  inquiryNotificationSubject,
  inquiryNotificationText,
} from "@/lib/inquiries/notification";
import type { InquiryInput } from "@/lib/validation/inquiry";

export class ForwarderNotAvailableError extends Error {
  constructor() {
    super("FORWARDER_NOT_AVAILABLE");
    this.name = "ForwarderNotAvailableError";
  }
}

export interface InquiryResult {
  id: string;
  status: string;
}

/**
 * Create an inquiry. The row is persisted BEFORE the email is attempted, so a
 * provider failure never loses the lead (status stays "queued" for retry).
 * Idempotent on idempotencyKey.
 */
export async function createInquiry(input: InquiryInput): Promise<InquiryResult> {
  // Idempotency: return the existing inquiry if this key was already used.
  if (input.idempotencyKey) {
    const existing = await prisma.inquiry.findUnique({
      where: { idempotencyKey: input.idempotencyKey },
      select: { id: true, status: true },
    });
    if (existing) return existing;
  }

  const forwarder = await prisma.forwarderProfile.findFirst({
    where: { slug: input.forwarderSlug, status: "approved" },
    select: { id: true, companyName: true, owner: { select: { email: true } } },
  });
  if (!forwarder) throw new ForwarderNotAvailableError();

  // 1. Persist first.
  const inquiry = await prisma.inquiry.create({
    data: {
      forwarderId: forwarder.id,
      shipperName: input.shipperName,
      shipperEmail: input.shipperEmail,
      shipperCompany: input.shipperCompany ?? null,
      originCountry: input.originCountry ?? null,
      originPort: input.originPort ?? null,
      destinationCountry: input.destinationCountry ?? null,
      destinationPort: input.destinationPort ?? null,
      mode: input.mode ?? null,
      cargoType: input.cargoType ?? null,
      message: input.message,
      idempotencyKey: input.idempotencyKey ?? null,
      status: "queued",
    },
    select: { id: true },
  });

  // 2. Notify — failure leaves the row "queued" for the retry worker.
  try {
    await sendEmail({
      to: forwarder.owner.email,
      subject: inquiryNotificationSubject(forwarder.companyName),
      text: inquiryNotificationText(input, forwarder.companyName),
    });
    await prisma.inquiry.update({
      where: { id: inquiry.id },
      data: { status: "sent" },
    });
    return { id: inquiry.id, status: "sent" };
  } catch {
    return { id: inquiry.id, status: "queued" };
  }
}
