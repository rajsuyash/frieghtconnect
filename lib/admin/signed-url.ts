import { createHmac, timingSafeEqual } from "node:crypto";

// Short-lived signed URLs for private KYC documents. The signature binds the
// document id + expiry with AUTH_SECRET, so a link cannot be forged or reused
// after it expires. In production these are S3 presigned URLs; in dev they
// point at the admin-only download route which re-checks the signature.

const TTL_SECONDS = 5 * 60; // 5 minutes

function secret(): string {
  return process.env.AUTH_SECRET || "dev-insecure-secret";
}

function sign(documentId: string, exp: number): string {
  return createHmac("sha256", secret()).update(`${documentId}.${exp}`).digest("hex");
}

export function createSignedDocPath(documentId: string): string {
  const exp = Math.floor(Date.now() / 1000) + TTL_SECONDS;
  const sig = sign(documentId, exp);
  return `/api/admin/documents/${documentId}?exp=${exp}&sig=${sig}`;
}

export function verifyDocSignature(
  documentId: string,
  exp: string | null,
  sig: string | null,
): boolean {
  if (!exp || !sig) return false;
  const expNum = Number(exp);
  if (!Number.isFinite(expNum) || expNum < Math.floor(Date.now() / 1000)) return false;

  const expected = sign(documentId, expNum);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
