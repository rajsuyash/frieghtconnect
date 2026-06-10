"use client";

import * as React from "react";
import Link from "next/link";
import { PaperPlaneTilt, CheckCircle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MODES } from "@/lib/taxonomy";
import { COUNTRIES } from "@/lib/geo";

function CountrySelect({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="h-11 w-full cursor-pointer rounded-xl border border-[var(--color-line)] bg-white px-4 text-sm text-[var(--color-ink)] focus:border-[var(--color-accent)] focus:outline-none">
      <option value="">{placeholder}</option>
      {COUNTRIES.map((c) => (
        <option key={c.code} value={c.code}>{c.label}</option>
      ))}
    </select>
  );
}

export function InquiryForm({ slug, company }: { slug: string; company: string }) {
  const idemKey = React.useRef<string>(
    typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Math.random()),
  );
  const [form, setForm] = React.useState({
    shipperName: "",
    shipperEmail: "",
    shipperCompany: "",
    originCountry: "",
    originPort: "",
    destinationCountry: "",
    destinationPort: "",
    mode: "",
    cargoType: "",
    message: "",
    website: "", // honeypot
  });
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [inquiryId, setInquiryId] = React.useState<string | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          forwarderSlug: slug,
          ...form,
          idempotencyKey: idemKey.current,
        }),
      });
      if (res.status === 201) {
        const data = await res.json().catch(() => null);
        if (data?.id) setInquiryId(data.id);
        setSent(true);
      } else if (res.status === 429) {
        setError("Too many requests. Please try again shortly.");
      } else if (res.status === 404) {
        setError("This forwarder is not currently accepting inquiries.");
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

  if (sent) {
    return (
      <div className="rounded-3xl border border-[var(--color-line)] bg-white p-10 text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-verified-soft)] text-[var(--color-verified)]">
          <CheckCircle size={34} weight="fill" />
        </span>
        <h2 className="mt-5 text-2xl font-bold text-[var(--color-ink)]">Inquiry sent</h2>
        <p className="mx-auto mt-2 max-w-md text-[var(--color-muted)]">
          We forwarded your request to {company}. They reply directly to{" "}
          <strong>{form.shipperEmail}</strong>.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link href={`/forwarders/${slug}`}>
            <Button variant="secondary">Back to profile</Button>
          </Link>
          {inquiryId && (
            <Link href={`/forwarders/${slug}/review?inquiry=${inquiryId}`}>
              <Button variant="secondary">Rate your experience</Button>
            </Link>
          )}
        </div>
        {inquiryId && (
          <p className="mt-3 text-xs text-[var(--color-faint)]">
            Keep this reference to review later: {inquiryId}
          </p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-6 rounded-3xl border border-[var(--color-line)] bg-white p-7">
      {/* honeypot */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={set("website")} className="hidden" aria-hidden="true" />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name" required>
          <Input required value={form.shipperName} onChange={set("shipperName")} placeholder="Jane Doe" />
        </Field>
        <Field label="Email" required>
          <Input type="email" required value={form.shipperEmail} onChange={set("shipperEmail")} placeholder="you@company.com" />
        </Field>
        <Field label="Company" full>
          <Input value={form.shipperCompany} onChange={set("shipperCompany")} placeholder="Buyer Co" />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Origin country">
          <CountrySelect value={form.originCountry} onChange={(v) => setForm((f) => ({ ...f, originCountry: v }))} placeholder="Select origin" />
        </Field>
        <Field label="Origin port (UN/LOCODE)">
          <Input value={form.originPort} onChange={set("originPort")} placeholder="CNSHA" />
        </Field>
        <Field label="Destination country">
          <CountrySelect value={form.destinationCountry} onChange={(v) => setForm((f) => ({ ...f, destinationCountry: v }))} placeholder="Select destination" />
        </Field>
        <Field label="Destination port (UN/LOCODE)">
          <Input value={form.destinationPort} onChange={set("destinationPort")} placeholder="DEHAM" />
        </Field>
        <Field label="Transport mode">
          <select value={form.mode} onChange={set("mode")} className="h-11 w-full cursor-pointer rounded-xl border border-[var(--color-line)] bg-white px-4 text-sm text-[var(--color-ink)] focus:border-[var(--color-accent)] focus:outline-none">
            <option value="">Any mode</option>
            {MODES.map((m) => (<option key={m.code} value={m.code}>{m.label}</option>))}
          </select>
        </Field>
        <Field label="Cargo type">
          <Input value={form.cargoType} onChange={set("cargoType")} placeholder="General, reefer, DG…" />
        </Field>
      </div>

      <Field label="Message" required>
        <textarea required rows={4} value={form.message} onChange={set("message")} placeholder="Describe your shipment, volumes, and timing." className="w-full rounded-xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-faint)] focus:border-[var(--color-accent)] focus:outline-none" />
      </Field>

      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <Button type="submit" size="lg" disabled={loading}>
        <PaperPlaneTilt size={18} weight="fill" />
        {loading ? "Sending…" : "Send inquiry"}
      </Button>
    </form>
  );
}

function Field({ label, required, full, children }: { label: string; required?: boolean; full?: boolean; children: React.ReactNode }) {
  return (
    <div className={`space-y-2 ${full ? "sm:col-span-2" : ""}`}>
      <label className="text-sm font-medium text-[var(--color-ink)]">
        {label}
        {required && <span className="text-[var(--color-accent)]"> *</span>}
      </label>
      {children}
    </div>
  );
}
