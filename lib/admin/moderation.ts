import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { canTransition } from "@/lib/forwarders/status";
import { sendEmail } from "@/lib/email";

export class NotFoundError extends Error {
  constructor() {
    super("NOT_FOUND");
    this.name = "NotFoundError";
  }
}
export class AlreadyApprovedError extends Error {
  constructor() {
    super("ALREADY_APPROVED");
    this.name = "AlreadyApprovedError";
  }
}
export class ReasonRequiredError extends Error {
  constructor() {
    super("REASON_REQUIRED");
    this.name = "ReasonRequiredError";
  }
}
export class InvalidTransitionError extends Error {
  constructor() {
    super("INVALID_TRANSITION");
    this.name = "InvalidTransitionError";
  }
}

async function loadForwarder(id: string) {
  const f = await prisma.forwarderProfile.findUnique({
    where: { id },
    select: { id: true, status: true, companyName: true, owner: { select: { email: true } } },
  });
  if (!f) throw new NotFoundError();
  return f;
}

async function audit(
  actorId: string,
  action: string,
  targetId: string,
  meta?: Record<string, unknown>,
) {
  await prisma.auditLog.create({
    data: {
      actorId,
      action,
      targetType: "ForwarderProfile",
      targetId,
      meta: (meta ?? undefined) as Prisma.InputJsonValue | undefined,
    },
  });
}

export async function listPending() {
  return prisma.forwarderProfile.findMany({
    where: { status: "pending" },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      slug: true,
      companyName: true,
      primaryCountry: true,
      createdAt: true,
      modes: true,
      _count: { select: { documents: true, countries: true } },
    },
  });
}

/** Full application for the review screen — includes KYC document metadata (admin only). */
export async function getApplication(id: string) {
  const app = await prisma.forwarderProfile.findUnique({
    where: { id },
    select: {
      id: true,
      slug: true,
      companyName: true,
      primaryCountry: true,
      yearEstablished: true,
      websiteUrl: true,
      about: true,
      status: true,
      modes: true,
      services: true,
      rejectionReason: true,
      createdAt: true,
      owner: { select: { email: true } },
      countries: { select: { country: true, city: true, isHeadquarters: true, ports: true } },
      lanes: { select: { originCountry: true, destinationCountry: true } },
      documents: { select: { id: true, type: true, mimeType: true, sizeBytes: true, uploadedAt: true } },
    },
  });
  return app;
}

export async function approveForwarder(adminId: string, id: string) {
  const f = await loadForwarder(id);
  if (f.status === "approved") throw new AlreadyApprovedError();
  if (!canTransition(f.status, "approved")) throw new InvalidTransitionError();

  await prisma.forwarderProfile.update({
    where: { id },
    data: {
      status: "approved",
      verified: true,
      reviewedById: adminId,
      reviewedAt: new Date(),
      rejectionReason: null,
    },
  });
  await audit(adminId, "forwarder.approve", id);
  await sendEmail({
    to: f.owner.email,
    subject: "Your FreightConnect profile is approved",
    text: `Good news — ${f.companyName} passed verification and is now live in the directory with a verified badge.`,
  });
  return { id, status: "approved" as const, verified: true };
}

export async function rejectForwarder(adminId: string, id: string, reason: string) {
  if (!reason || reason.trim().length === 0) throw new ReasonRequiredError();
  const f = await loadForwarder(id);
  if (!canTransition(f.status, "rejected")) throw new InvalidTransitionError();

  await prisma.forwarderProfile.update({
    where: { id },
    data: {
      status: "rejected",
      verified: false,
      reviewedById: adminId,
      reviewedAt: new Date(),
      rejectionReason: reason.trim(),
    },
  });
  await audit(adminId, "forwarder.reject", id, { reason: reason.trim() });
  await sendEmail({
    to: f.owner.email,
    subject: "Your FreightConnect application needs changes",
    text: `Your application for ${f.companyName} was not approved.\n\nReason: ${reason.trim()}\n\nYou can update your profile and resubmit.`,
  });
  return { id, status: "rejected" as const };
}

export async function suspendForwarder(adminId: string, id: string) {
  const f = await loadForwarder(id);
  if (!canTransition(f.status, "suspended")) throw new InvalidTransitionError();

  await prisma.forwarderProfile.update({
    where: { id },
    data: { status: "suspended", verified: false, reviewedById: adminId, reviewedAt: new Date() },
  });
  await audit(adminId, "forwarder.suspend", id);
  return { id, status: "suspended" as const };
}
