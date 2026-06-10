import { promises as fs } from "node:fs";
import path from "node:path";
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

// KYC object storage behind a thin interface. Dev writes to a gitignored
// .uploads/ dir; production uses an S3-compatible bucket (Railway bucket / R2 /
// S3) selected by env. Objects are PRIVATE — only ever served via the
// admin-only signed-download route.
//
// Env (production): S3_ENDPOINT, S3_REGION, S3_BUCKET,
//                   S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY

const DEV_ROOT = path.join(process.cwd(), ".uploads");

export const ALLOWED_KYC_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
]);
export const MAX_KYC_BYTES = 10 * 1024 * 1024; // 10 MB

function isS3Configured(): boolean {
  return Boolean(
    process.env.S3_ENDPOINT &&
      process.env.S3_BUCKET &&
      process.env.S3_ACCESS_KEY_ID &&
      process.env.S3_SECRET_ACCESS_KEY,
  );
}

let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (!s3Client) {
    s3Client = new S3Client({
      endpoint: process.env.S3_ENDPOINT,
      region: process.env.S3_REGION || "auto",
      // Path-style keeps compatibility with non-AWS S3 endpoints (Railway, MinIO).
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
      },
    });
  }
  return s3Client;
}

export async function putKycObject(
  key: string,
  data: Buffer,
  contentType: string,
): Promise<void> {
  if (isS3Configured()) {
    await getS3Client().send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: key,
        Body: data,
        ContentType: contentType,
      }),
    );
    return;
  }
  const dest = path.join(DEV_ROOT, key);
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, data);
}

/** Read a stored KYC object (admin-only callers). */
export async function getKycObject(key: string): Promise<Buffer> {
  if (isS3Configured()) {
    const res = await getS3Client().send(
      new GetObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key }),
    );
    if (!res.Body) {
      throw new Error(`KYC object missing body: ${key}`);
    }
    return Buffer.from(await res.Body.transformToByteArray());
  }
  return fs.readFile(path.join(DEV_ROOT, key));
}

export function buildKycKey(forwarderId: string, filename: string): string {
  const ext = (filename.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
  const rand = Math.random().toString(36).slice(2, 10);
  return `kyc/${forwarderId}/${Date.now()}-${rand}.${ext}`;
}
