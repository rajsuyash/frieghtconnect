import { z } from "zod";
import { MODE_CODES } from "@/lib/taxonomy";

const modeEnum = z.enum(MODE_CODES as [string, ...string[]]);

export const inquirySchema = z.object({
  forwarderSlug: z.string().min(1),
  shipperName: z.string().trim().min(1).max(120),
  shipperEmail: z.string().email().max(200),
  shipperCompany: z.string().trim().max(160).optional(),
  originCountry: z.string().length(2).optional(),
  originPort: z.string().trim().max(20).optional(),
  destinationCountry: z.string().length(2).optional(),
  destinationPort: z.string().trim().max(20).optional(),
  mode: modeEnum.optional(),
  cargoType: z.string().trim().max(60).optional(),
  message: z.string().trim().min(5).max(2000),
  idempotencyKey: z.string().max(100).optional(),
});

export type InquiryInput = z.infer<typeof inquirySchema>;
