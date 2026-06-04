// Server-generated, unique, immutable-once-approved slugs (PRD F3 pitfalls).

/** Turn a company name (optionally + country) into a URL-safe slug. */
export function slugify(companyName: string, country?: string): string {
  const base = companyName
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "") // strip diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const suffix = country ? `-${country.toLowerCase()}` : "";
  const slug = `${base}${suffix}`.replace(/^-+|-+$/g, "");
  return slug.length > 0 ? slug : "forwarder";
}

/**
 * Resolve collisions by appending -2, -3, ... The `exists` checker is injected
 * (DB lookup in production, in-memory set in tests) so this stays pure-ish.
 */
export async function generateUniqueSlug(
  base: string,
  exists: (slug: string) => Promise<boolean>,
): Promise<string> {
  if (!(await exists(base))) return base;
  let n = 2;
  // bounded to avoid an unbounded loop on a pathological checker
  while (n < 10000) {
    const candidate = `${base}-${n}`;
    if (!(await exists(candidate))) return candidate;
    n++;
  }
  throw new Error(`could not generate a unique slug for "${base}"`);
}
