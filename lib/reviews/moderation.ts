import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { NotFoundError } from "@/lib/admin/moderation";

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
      targetType: "Review",
      targetId,
      meta: (meta ?? undefined) as Prisma.InputJsonValue | undefined,
    },
  });
}

async function setReviewStatus(
  adminId: string,
  id: string,
  status: "approved" | "rejected",
) {
  const review = await prisma.review.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!review) throw new NotFoundError();

  await prisma.review.update({ where: { id }, data: { status } });
  await audit(adminId, `review.${status === "approved" ? "approve" : "reject"}`, id);
  return { id, status };
}

/** Approve a pending review — it becomes public and counts in the aggregate. */
export async function approveReview(adminId: string, id: string) {
  return setReviewStatus(adminId, id, "approved");
}

/** Reject a review — never shown publicly, kept for audit. */
export async function rejectReview(adminId: string, id: string) {
  return setReviewStatus(adminId, id, "rejected");
}
