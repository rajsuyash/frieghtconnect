import { describe, it, expect, afterAll, beforeEach, vi } from "vitest";

const sendEmailMock = vi.fn();
vi.mock("@/lib/email", () => ({
  sendEmail: (...args: unknown[]) => sendEmailMock(...args),
  appBaseUrl: () => "http://localhost:3000",
}));

import { prisma } from "@/lib/db";
import { createInquiry, ForwarderNotAvailableError } from "@/lib/inquiries/create";
import { rateLimit, resetRateLimit } from "@/lib/rate-limit";

const APPROVED_SLUG = "meridian-shipping-rotterdam-nl";
const SHIPPER = "zzinq@test.example";

beforeEach(() => {
  sendEmailMock.mockReset();
  sendEmailMock.mockResolvedValue(undefined);
  resetRateLimit();
});

afterAll(async () => {
  await prisma.inquiry.deleteMany({ where: { shipperEmail: SHIPPER } });
  await prisma.$disconnect();
});

const base = {
  forwarderSlug: APPROVED_SLUG,
  shipperName: "Mara Test",
  shipperEmail: SHIPPER,
  destinationCountry: "DE",
  mode: "sea_fcl" as const,
  message: "Need a quote for 2x40HC monthly.",
};

describe("rateLimit", () => {
  it("allows up to the max, then throttles", () => {
    const key = "k";
    for (let i = 0; i < 5; i++) expect(rateLimit(key, 5, 60_000)).toBe(true);
    expect(rateLimit(key, 5, 60_000)).toBe(false);
  });
});

describe("createInquiry", () => {
  it("persists the inquiry then sends the email (status sent)", async () => {
    const res = await createInquiry(base);
    expect(res.status).toBe("sent");
    const row = await prisma.inquiry.findUnique({ where: { id: res.id } });
    expect(row?.shipperEmail).toBe(SHIPPER);
    expect(sendEmailMock).toHaveBeenCalledTimes(1);
    // notification goes to the forwarder's owner account email
    expect(sendEmailMock.mock.calls[0][0].to).toContain("@seed.freightconnect.example");
  });

  it("keeps the lead (status queued) when the email provider fails", async () => {
    sendEmailMock.mockRejectedValueOnce(new Error("provider down"));
    const res = await createInquiry({ ...base });
    expect(res.status).toBe("queued");
    const row = await prisma.inquiry.findUnique({ where: { id: res.id } });
    expect(row).not.toBeNull(); // persisted despite the send failure
  });

  it("is idempotent on idempotencyKey", async () => {
    const key = `zzinq-idem-${Date.now()}`;
    const a = await createInquiry({ ...base, idempotencyKey: key });
    const b = await createInquiry({ ...base, idempotencyKey: key });
    expect(b.id).toBe(a.id);
    const count = await prisma.inquiry.count({ where: { idempotencyKey: key } });
    expect(count).toBe(1);
  });

  it("rejects an inquiry to a non-approved / unknown forwarder", async () => {
    await expect(
      createInquiry({ ...base, forwarderSlug: "no-such-forwarder-zz" }),
    ).rejects.toBeInstanceOf(ForwarderNotAvailableError);
  });
});
