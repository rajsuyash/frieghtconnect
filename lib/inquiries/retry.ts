import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import {
  inquiryNotificationSubject,
  inquiryNotificationText,
} from "@/lib/inquiries/notification";

// Inquiries still "queued" after this long are marked "failed" and surfaced in
// the result so an operator can chase them manually — the lead is never deleted.
const GIVE_UP_AFTER_MS = 24 * 60 * 60 * 1000; // 24h
const BATCH_SIZE = 50;

export interface RetryResult {
  retried: number;
  sent: number;
  failed: number;
}

/**
 * Re-attempt notification email for every queued inquiry (oldest first).
 * Persist-first invariant means the rows already exist; this only flips
 * status queued -> sent (delivered) or queued -> failed (gave up after 24h).
 */
export async function retryQueuedInquiries(): Promise<RetryResult> {
  const queued = await prisma.inquiry.findMany({
    where: { status: "queued" },
    orderBy: { createdAt: "asc" },
    take: BATCH_SIZE,
    select: {
      id: true,
      createdAt: true,
      shipperName: true,
      shipperEmail: true,
      shipperCompany: true,
      originCountry: true,
      originPort: true,
      destinationCountry: true,
      destinationPort: true,
      mode: true,
      cargoType: true,
      message: true,
      forwarder: {
        select: { companyName: true, owner: { select: { email: true } } },
      },
    },
  });

  const result: RetryResult = { retried: queued.length, sent: 0, failed: 0 };

  for (const inquiry of queued) {
    try {
      await sendEmail({
        to: inquiry.forwarder.owner.email,
        subject: inquiryNotificationSubject(inquiry.forwarder.companyName),
        text: inquiryNotificationText(inquiry, inquiry.forwarder.companyName),
      });
      await prisma.inquiry.update({
        where: { id: inquiry.id },
        data: { status: "sent" },
      });
      result.sent += 1;
    } catch {
      const age = Date.now() - inquiry.createdAt.getTime();
      if (age > GIVE_UP_AFTER_MS) {
        await prisma.inquiry.update({
          where: { id: inquiry.id },
          data: { status: "failed" },
        });
        result.failed += 1;
      }
      // Otherwise leave it queued for the next run.
    }
  }

  return result;
}
