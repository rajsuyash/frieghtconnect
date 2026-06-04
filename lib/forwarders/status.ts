// Forwarder lifecycle. See docs/PRD.md §5 invariants.

export type ForwarderStatus =
  | "draft"
  | "pending"
  | "approved"
  | "rejected"
  | "suspended";

const ALLOWED: Record<ForwarderStatus, ForwarderStatus[]> = {
  draft: ["pending"],
  pending: ["approved", "rejected"],
  approved: ["suspended"],
  rejected: ["pending"], // applicant may resubmit after fixing
  suspended: ["approved"],
};

export function canTransition(
  from: ForwarderStatus,
  to: ForwarderStatus,
): boolean {
  return ALLOWED[from]?.includes(to) ?? false;
}

/** A profile is public (directory + profile page) ONLY when approved. */
export function isPubliclyVisible(status: ForwarderStatus): boolean {
  return status === "approved";
}

/** verified=true is only consistent when status=approved. */
export function verifiedIsConsistent(
  status: ForwarderStatus,
  verified: boolean,
): boolean {
  return verified ? status === "approved" : true;
}
