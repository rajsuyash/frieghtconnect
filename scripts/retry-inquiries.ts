import "dotenv/config";
import { retryQueuedInquiries } from "../lib/inquiries/retry";
import { prisma } from "../lib/db";

// Railway cron entry: re-send notification emails for queued inquiries.
// Usage: pnpm retry:inquiries
async function main() {
  const result = await retryQueuedInquiries();
  console.info(
    `[retry-inquiries] retried=${result.retried} sent=${result.sent} failed=${result.failed}`,
  );
}

main()
  .catch((err) => {
    console.error("[retry-inquiries] run failed", err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
