import { prisma } from "@/lib/db";
import { slugify, generateUniqueSlug } from "@/lib/forwarders/slug";
import { canTransition } from "@/lib/forwarders/status";
import { putKycObject, buildKycKey } from "@/lib/storage";
import type { ForwarderDraft } from "@/lib/validation/forwarder";
import type { KycType } from "@prisma/client";

export class NoDraftError extends Error {
  constructor() {
    super("NO_DRAFT");
    this.name = "NoDraftError";
  }
}
export class NotVerifiedError extends Error {
  constructor() {
    super("EMAIL_NOT_VERIFIED");
    this.name = "NotVerifiedError";
  }
}
export class IncompleteError extends Error {
  missing: string[];
  constructor(missing: string[]) {
    super("INCOMPLETE");
    this.name = "IncompleteError";
    this.missing = missing;
  }
}

async function slugExists(slug: string): Promise<boolean> {
  return (await prisma.forwarderProfile.count({ where: { slug } })) > 0;
}

/** Create the owner's draft (1:1) or update it. Coverage is replaced on save. */
export async function saveDraft(ownerUserId: string, input: ForwarderDraft) {
  const existing = await prisma.forwarderProfile.findUnique({
    where: { ownerUserId },
  });

  const base = {
    companyName: input.companyName,
    primaryCountry: input.primaryCountry,
    yearEstablished: input.yearEstablished ?? null,
    websiteUrl: input.websiteUrl ?? null,
    about: input.about ?? null,
    modes: input.modes ?? [],
    services: input.services ?? [],
  };
  const coverage = (input.countriesServed ?? []).map((c) => ({
    country: c.country,
    city: c.city ?? null,
    isHeadquarters: c.isHeadquarters ?? false,
    ports: c.ports ?? [],
  }));

  if (existing) {
    await prisma.$transaction([
      prisma.countryCoverage.deleteMany({ where: { forwarderId: existing.id } }),
      prisma.forwarderProfile.update({
        where: { id: existing.id },
        data: { ...base, countries: { create: coverage } },
      }),
    ]);
    return { id: existing.id, slug: existing.slug, status: existing.status };
  }

  const slug = await generateUniqueSlug(
    slugify(input.companyName, input.primaryCountry),
    slugExists,
  );
  const created = await prisma.forwarderProfile.create({
    data: {
      ownerUserId,
      slug,
      status: "draft",
      ...base,
      countries: { create: coverage },
    },
    select: { id: true, slug: true, status: true },
  });
  return created;
}

export async function addKycDocument(
  ownerUserId: string,
  file: { filename: string; type: KycType; mimeType: string; data: Buffer },
) {
  const forwarder = await prisma.forwarderProfile.findUnique({
    where: { ownerUserId },
    select: { id: true },
  });
  if (!forwarder) throw new NoDraftError();

  const key = buildKycKey(forwarder.id, file.filename);
  await putKycObject(key, file.data, file.mimeType);
  return prisma.kycDocument.create({
    data: {
      forwarderId: forwarder.id,
      type: file.type,
      storageKey: key,
      mimeType: file.mimeType,
      sizeBytes: file.data.length,
    },
    select: { id: true, type: true, uploadedAt: true },
  });
}

/** Transition draft → pending after validating completeness + email verification. */
export async function submitForReview(ownerUserId: string) {
  const user = await prisma.user.findUnique({
    where: { id: ownerUserId },
    select: { emailVerified: true },
  });
  if (!user?.emailVerified) throw new NotVerifiedError();

  const forwarder = await prisma.forwarderProfile.findUnique({
    where: { ownerUserId },
    select: {
      id: true,
      status: true,
      modes: true,
      companyName: true,
      primaryCountry: true,
      _count: { select: { countries: true, documents: true } },
    },
  });
  if (!forwarder) throw new NoDraftError();
  if (forwarder.status === "pending") {
    return { id: forwarder.id, status: "pending" as const }; // idempotent
  }

  const missing: string[] = [];
  if (forwarder._count.countries < 1) missing.push("countriesServed");
  if (forwarder.modes.length < 1) missing.push("modes");
  if (forwarder._count.documents < 1) missing.push("kycDocument");
  if (missing.length > 0) throw new IncompleteError(missing);

  if (!canTransition(forwarder.status, "pending")) {
    throw new IncompleteError(["status"]);
  }

  await prisma.forwarderProfile.update({
    where: { id: forwarder.id },
    data: { status: "pending" },
  });
  return { id: forwarder.id, status: "pending" as const };
}
