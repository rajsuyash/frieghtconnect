import { promises as fs } from "node:fs";
import path from "node:path";

// KYC object storage behind a thin interface. Dev writes to a gitignored
// .uploads/ dir; production uses a Railway/S3 bucket (wired at ship). Objects
// are PRIVATE — only ever served via the admin-only signed-download route.

const DEV_ROOT = path.join(process.cwd(), ".uploads");

export const ALLOWED_KYC_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
]);
export const MAX_KYC_BYTES = 10 * 1024 * 1024; // 10 MB

function isS3Configured(): boolean {
  return Boolean(process.env.S3_ENDPOINT && process.env.S3_ACCESS_KEY_ID);
}

export async function putKycObject(
  key: string,
  data: Buffer,
  _contentType: string,
): Promise<void> {
  if (isS3Configured()) {
    // TODO(ship): PutObject to the Railway/S3 bucket via @aws-sdk/client-s3.
    throw new Error("S3 storage not yet wired — set up at ship");
  }
  const dest = path.join(DEV_ROOT, key);
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, data);
}

/** Read a stored KYC object (admin-only callers). */
export async function getKycObject(key: string): Promise<Buffer> {
  if (isS3Configured()) {
    throw new Error("S3 storage not yet wired — set up at ship");
  }
  return fs.readFile(path.join(DEV_ROOT, key));
}

export function buildKycKey(forwarderId: string, filename: string): string {
  const ext = (filename.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
  const rand = Math.random().toString(36).slice(2, 10);
  return `kyc/${forwarderId}/${Date.now()}-${rand}.${ext}`;
}
