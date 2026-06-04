// In-memory sliding-window rate limiter. Fine for a single instance (dev +
// v1 Railway). Swap for a Postgres/Redis-backed limiter when scaling out.

const buckets = new Map<string, number[]>();

/** Returns true if the action is allowed (under the limit), false if throttled. */
export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= max) {
    buckets.set(key, hits);
    return false;
  }
  hits.push(now);
  buckets.set(key, hits);
  return true;
}

/** Test helper — clear all windows. */
export function resetRateLimit(): void {
  buckets.clear();
}
