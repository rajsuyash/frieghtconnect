import { z } from "zod";
import { MODE_CODES, SERVICE_CODES } from "@/lib/taxonomy";

const modeEnum = z.enum(MODE_CODES as [string, ...string[]]);
const serviceEnum = z.enum(SERVICE_CODES as [string, ...string[]]);

/** Directory query params (F1). Filters live in the URL, so values arrive as strings. */
export const directoryFilterSchema = z.object({
  country: z.string().length(2).optional(),
  port: z.string().optional(),
  mode: modeEnum.optional(),
  service: serviceEnum.optional(),
  originCountry: z.string().length(2).optional(),
  destinationCountry: z.string().length(2).optional(),
  q: z.string().trim().max(120).optional(),
  // page/pageSize clamp rather than reject — out-of-range is capped, not a 400.
  page: z
    .coerce.number()
    .int()
    .default(1)
    .transform((n) => Math.max(1, n)),
  pageSize: z
    .coerce.number()
    .int()
    .default(20)
    .transform((n) => Math.min(Math.max(1, n), 200)),
});

export type DirectoryFilter = z.infer<typeof directoryFilterSchema>;

const countryCoverage = z.object({
  country: z.string().length(2),
  city: z.string().max(120).optional(),
  isHeadquarters: z.boolean().default(false),
  ports: z.array(z.string()).default([]),
});

/** Step-level autosave during onboarding — permissive (F3). */
export const forwarderDraftSchema = z.object({
  companyName: z.string().min(2).max(160),
  primaryCountry: z.string().length(2),
  yearEstablished: z.number().int().min(1800).max(2100).optional(),
  websiteUrl: z.string().url().optional(),
  about: z.string().max(2000).optional(),
  countriesServed: z.array(countryCoverage).optional(),
  modes: z.array(modeEnum).optional(),
  services: z.array(serviceEnum).optional(),
});

export type ForwarderDraft = z.infer<typeof forwarderDraftSchema>;

/** Submit-for-review gate — stricter (F3 AC2): needs ≥1 country and ≥1 mode. */
export const forwarderSubmitSchema = forwarderDraftSchema.extend({
  countriesServed: z.array(countryCoverage).min(1),
  modes: z.array(modeEnum).min(1),
  services: z.array(serviceEnum).default([]),
});

export type ForwarderSubmit = z.infer<typeof forwarderSubmitSchema>;
