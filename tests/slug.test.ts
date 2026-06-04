import { describe, it, expect } from "vitest";
import { slugify, generateUniqueSlug } from "@/lib/forwarders/slug";

describe("slugify", () => {
  it("lowercases and hyphenates a company name", () => {
    expect(slugify("ACME Logistics GmbH")).toBe("acme-logistics-gmbh");
  });

  it("strips punctuation and collapses whitespace", () => {
    expect(slugify("  Meridian   Shipping, Rotterdam!  ")).toBe(
      "meridian-shipping-rotterdam",
    );
  });

  it("transliterates common accents", () => {
    expect(slugify("Café Cärgo")).toBe("cafe-cargo");
  });

  it("appends a country suffix when provided", () => {
    expect(slugify("ACME Logistics", "DE")).toBe("acme-logistics-de");
  });

  it("never returns an empty slug", () => {
    expect(slugify("!!!").length).toBeGreaterThan(0);
  });
});

describe("generateUniqueSlug", () => {
  it("returns the base slug when it is free", async () => {
    const exists = async () => false;
    expect(await generateUniqueSlug("acme-logistics-de", exists)).toBe(
      "acme-logistics-de",
    );
  });

  it("suffixes -2, -3 on collision", async () => {
    const taken = new Set(["acme-logistics-de", "acme-logistics-de-2"]);
    const exists = async (s: string) => taken.has(s);
    expect(await generateUniqueSlug("acme-logistics-de", exists)).toBe(
      "acme-logistics-de-3",
    );
  });
});
