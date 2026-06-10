import { z } from "zod";

// F9 — shipper review submission. Reviewer is verified by matching the
// inquiry's shipperEmail (shippers are anonymous in v1, no account).
export const reviewSchema = z.object({
  inquiryId: z.string().min(1),
  shipperEmail: z.string().email().max(254),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(2000).optional(),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
