import { describe, it, expect } from "vitest";
import {
  directoryFilterSchema,
  forwarderDraftSchema,
  forwarderSubmitSchema,
} from "@/lib/validation/forwarder";

describe("directoryFilterSchema", () => {
  it("accepts valid filters and applies pagination defaults", () => {
    const r = directoryFilterSchema.parse({ country: "DE", mode: "sea_fcl" });
    expect(r.country).toBe("DE");
    expect(r.mode).toBe("sea_fcl");
    expect(r.page).toBe(1);
    expect(r.pageSize).toBe(20);
  });

  it("coerces string page/pageSize from query params", () => {
    const r = directoryFilterSchema.parse({ page: "3", pageSize: "50" });
    expect(r.page).toBe(3);
    expect(r.pageSize).toBe(50);
  });

  it("caps pageSize at 200", () => {
    const r = directoryFilterSchema.parse({ pageSize: "9999" });
    expect(r.pageSize).toBe(200);
  });

  it("rejects an invalid mode", () => {
    const r = directoryFilterSchema.safeParse({ mode: "teleport" });
    expect(r.success).toBe(false);
  });

  it("rejects an invalid service", () => {
    const r = directoryFilterSchema.safeParse({ service: "nonsense" });
    expect(r.success).toBe(false);
  });
});

describe("forwarderDraftSchema", () => {
  it("accepts a minimal draft (company + country)", () => {
    const r = forwarderDraftSchema.safeParse({
      companyName: "ACME Logistics",
      primaryCountry: "DE",
    });
    expect(r.success).toBe(true);
  });

  it("rejects a bad website URL", () => {
    const r = forwarderDraftSchema.safeParse({
      companyName: "ACME",
      primaryCountry: "DE",
      websiteUrl: "not-a-url",
    });
    expect(r.success).toBe(false);
  });
});

describe("forwarderSubmitSchema", () => {
  it("requires at least one country and one mode to submit", () => {
    const ok = forwarderSubmitSchema.safeParse({
      companyName: "ACME Logistics",
      primaryCountry: "DE",
      countriesServed: [{ country: "DE", isHeadquarters: true }],
      modes: ["sea_fcl"],
      services: ["customs_clearance"],
    });
    expect(ok.success).toBe(true);

    const missing = forwarderSubmitSchema.safeParse({
      companyName: "ACME Logistics",
      primaryCountry: "DE",
      countriesServed: [],
      modes: [],
      services: [],
    });
    expect(missing.success).toBe(false);
  });
});
