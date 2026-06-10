"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

/** Approve / reject buttons for one pending shipper review (admin console). */
export function ReviewModerationActions({ reviewId }: { reviewId: string }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState<"approve" | "reject" | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function act(action: "approve" | "reject") {
    setBusy(action);
    setError(null);
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}/${action}`, {
        method: "POST",
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Action failed");
      }
    } catch {
      setError("Action failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {error && <span className="text-xs text-red-600">{error}</span>}
      <Button size="sm" disabled={busy !== null} onClick={() => act("approve")}>
        <Check size={14} weight="bold" />
        {busy === "approve" ? "Approving…" : "Approve"}
      </Button>
      <Button
        size="sm"
        variant="secondary"
        disabled={busy !== null}
        onClick={() => act("reject")}
      >
        <X size={14} weight="bold" />
        {busy === "reject" ? "Rejecting…" : "Reject"}
      </Button>
    </div>
  );
}
