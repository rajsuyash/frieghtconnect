"use client";

import * as React from "react";
import Link from "next/link";
import { Star, CheckCircle, PaperPlaneTilt } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ReviewFormProps {
  slug: string;
  company: string;
  initialInquiryId?: string;
}

export function ReviewForm({ slug, company, initialInquiryId }: ReviewFormProps) {
  const [form, setForm] = React.useState({
    inquiryId: initialInquiryId ?? "",
    shipperEmail: "",
    comment: "",
    website: "", // honeypot
  });
  const [rating, setRating] = React.useState(0);
  const [hover, setHover] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [done, setDone] = React.useState(false);

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (rating < 1) {
      setError("Please pick a star rating.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inquiryId: form.inquiryId.trim(),
          shipperEmail: form.shipperEmail.trim(),
          rating,
          comment: form.comment.trim() || undefined,
          website: form.website,
        }),
      });
      if (res.status === 201) {
        setDone(true);
      } else if (res.status === 403) {
        setError("This email does not match the inquiry on file.");
      } else if (res.status === 404) {
        setError("We could not find that inquiry reference.");
      } else if (res.status === 409) {
        setError("This inquiry has already been reviewed.");
      } else if (res.status === 429) {
        setError("Too many requests. Please try again shortly.");
      } else {
        const data = await res.json().catch(() => null);
        setError(data?.field ? `Please complete: ${data.field}` : "Please check your details and try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-3xl border border-[var(--color-line)] bg-white p-10 text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-verified-soft)] text-[var(--color-verified)]">
          <CheckCircle size={34} weight="fill" />
        </span>
        <h2 className="mt-5 text-2xl font-bold text-[var(--color-ink)]">Review submitted</h2>
        <p className="mx-auto mt-2 max-w-md text-[var(--color-muted)]">
          Thanks for rating {company}. Your review will appear on the profile
          once our team has checked it.
        </p>
        <Link href={`/forwarders/${slug}`} className="mt-6 inline-block">
          <Button variant="secondary">Back to profile</Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-6 rounded-3xl border border-[var(--color-line)] bg-white p-7">
      {/* honeypot */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={set("website")} className="hidden" aria-hidden="true" />

      <div className="space-y-2">
        <span className="text-sm font-medium text-[var(--color-ink)]">
          Rating<span className="text-[var(--color-accent)]"> *</span>
        </span>
        <div className="flex gap-1" role="radiogroup" aria-label="Star rating" data-testid="star-rating">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              className="cursor-pointer text-[var(--color-accent)] transition-transform hover:scale-110"
            >
              <Star size={30} weight={(hover || rating) >= n ? "fill" : "regular"} />
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Inquiry reference" required>
          <Input required value={form.inquiryId} onChange={set("inquiryId")} placeholder="From your inquiry confirmation" />
        </Field>
        <Field label="Email used on the inquiry" required>
          <Input type="email" required value={form.shipperEmail} onChange={set("shipperEmail")} placeholder="you@company.com" />
        </Field>
      </div>

      <Field label="Comment">
        <textarea
          rows={4}
          maxLength={2000}
          value={form.comment}
          onChange={set("comment")}
          placeholder={`How was working with ${company}?`}
          className="w-full rounded-xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-faint)] focus:border-[var(--color-accent)] focus:outline-none"
        />
      </Field>

      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <Button type="submit" size="lg" disabled={loading}>
        <PaperPlaneTilt size={18} weight="fill" />
        {loading ? "Submitting…" : "Submit review"}
      </Button>
    </form>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-[var(--color-ink)]">
        {label}
        {required && <span className="text-[var(--color-accent)]"> *</span>}
      </label>
      {children}
    </div>
  );
}
