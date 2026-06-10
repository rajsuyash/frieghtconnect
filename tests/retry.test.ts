import { describe, it, expect, afterAll, beforeEach, vi } from "vitest";

const sendEmailMock = vi.fn();
vi.mock("@/lib/email", () => ({
  sendEmail: (...args: unknown[]) => sendEmailMock(...args),
  appBaseUrl: () => "http://localhost:3000",
}));

import { prisma } from "@/lib/db";
import { retryQueuedInquiries } from "@/lib/inquiries/retry";

const APPROVED_SLUG = "meridian-shipping-rotterdam-nl";
const SHIPPER = "zzretry@test.example";

async function createQueuedInquiry(createdAt: Date): Promise<string> {
  const forwarder = await prisma.forwarderProfile.findFirstOrThrow({
    where: { slug: APPROVED_SLUG },
    select: { id: true },
  });
  const row = await prisma.inquiry.create({
    data: {
      forwarderId: forwarder.id,
      shipperName: "Retry Test",
      shipperEmail: SHIPPER,
      message: "Retry me.",
      status: "queued",
      createdAt,
    },
    select: { id: true },
  });
  return row.id;
}

beforeEach(async () => {
  sendEmailMock.mockReset();
  await prisma.inquiry.deleteMany({ where: { shipperEmail: SHIPPER } });
});

afterAll(async () => {
  await prisma.inquiry.deleteMany({ where: { shipperEmail: SHIPPER } });
  await prisma.$disconnect();
});

describe("retryQueuedInquiries", () => {
  it("re-sends queued inquiries and marks them sent", async () => {
    sendEmailMock.mockResolvedValue(undefined);
    const id = await createQueuedInquiry(new Date());

    const result = await retryQueuedInquiries();

    expect(result.sent).toBeGreaterThanOrEqual(1);
    expect(sendEmailMock).toHaveBeenCalled();
    const row = await prisma.inquiry.findUnique({ where: { id } });
    expect(row?.status).toBe("sent");
  });

  it("leaves a fresh inquiry queued when the provider still fails", async () => {
    sendEmailMock.mockRejectedValue(new Error("provider down"));
    const id = await createQueuedInquiry(new Date());

    await retryQueuedInquiries();

    const row = await prisma.inquiry.findUnique({ where: { id } });
    expect(row?.status).toBe("queued");
  });

  it("marks an inquiry failed after the 24h give-up window", async () => {
    sendEmailMock.mockRejectedValue(new Error("provider down"));
    const old = new Date(Date.now() - 25 * 60 * 60 * 1000);
    const id = await createQueuedInquiry(old);

    const result = await retryQueuedInquiries();

    expect(result.failed).toBeGreaterThanOrEqual(1);
    const row = await prisma.inquiry.findUnique({ where: { id } });
    expect(row?.status).toBe("failed");
  });
});
