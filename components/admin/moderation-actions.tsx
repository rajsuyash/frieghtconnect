"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, X, Prohibit } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

export function ModerationActions({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [rejecting, setRejecting] = React.useState(false);
  const [reason, setReason] = React.useState("");

  async function call(action: string, body?: unknown) {
    setBusy(action);
    setError(null);
    try {
      const res = await fetch(`/api/admin/forwarders/${id}/${action}`, {
        method: "POST",
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      if (res.ok) {
        router.push("/admin/review");
        router.refresh();
        return;
      }
      const data = await res.json().catch(() => null);
      setError(data?.error || "Action failed.");
    } catch {
      setError("Something went wrong.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      {status === "pending" && (
        <>
          {!rejecting ? (
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => call("approve")} size="lg" disabled={busy !== null}>
                <Check size={18} weight="bold" />
                {busy === "approve" ? "Approving…" : "Approve & verify"}
              </Button>
              <Button onClick={() => setRejecting(true)} variant="secondary" size="lg" disabled={busy !== null}>
                <X size={18} weight="bold" />
                Reject
              </Button>
            </div>
          ) : (
            <div className="space-y-3 rounded-2xl border border-[var(--color-line)] bg-[var(--color-canvas)] p-4">
              <label className="text-sm font-medium text-[var(--color-ink)]">
                Reason for rejection (sent to the applicant)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="e.g. The uploaded document is not a valid business registration."
                className="w-full rounded-xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm text-[var(--color-ink)] focus:border-[var(--color-accent)] focus:outline-none"
              />
              <div className="flex gap-3">
                <Button
                  onClick={() => call("reject", { reason })}
                  size="md"
                  disabled={busy !== null || reason.trim().length === 0}
                >
                  {busy === "reject" ? "Rejecting…" : "Confirm rejection"}
                </Button>
                <Button onClick={() => setRejecting(false)} variant="ghost" size="md">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {status === "approved" && (
        <Button onClick={() => call("suspend")} variant="secondary" size="lg" disabled={busy !== null}>
          <Prohibit size={18} weight="bold" />
          {busy === "suspend" ? "Suspending…" : "Suspend profile"}
        </Button>
      )}
    </div>
  );
}
