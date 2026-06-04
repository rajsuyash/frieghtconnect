"use client";

import * as React from "react";
import Link from "next/link";
import { CheckCircle, UploadSimple, FilePdf } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MODES, SERVICES } from "@/lib/taxonomy";
import { COUNTRIES } from "@/lib/geo";

interface UploadedDoc {
  id: string;
  name: string;
}

function toggle<T>(list: T[], v: T): T[] {
  return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
}

export function OnboardingWizard({ isVerified }: { isVerified: boolean }) {
  const [companyName, setCompanyName] = React.useState("");
  const [primaryCountry, setPrimaryCountry] = React.useState("");
  const [city, setCity] = React.useState("");
  const [yearEstablished, setYearEstablished] = React.useState("");
  const [websiteUrl, setWebsiteUrl] = React.useState("");
  const [about, setAbout] = React.useState("");
  const [extraCountries, setExtraCountries] = React.useState<string[]>([]);
  const [modes, setModes] = React.useState<string[]>([]);
  const [services, setServices] = React.useState<string[]>([]);

  const [draftSaved, setDraftSaved] = React.useState(false);
  const [docs, setDocs] = React.useState<UploadedDoc[]>([]);
  const [saving, setSaving] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [submitted, setSubmitted] = React.useState(false);

  function buildPayload() {
    const coverage = [
      { country: primaryCountry, city: city || undefined, isHeadquarters: true, ports: [] },
      ...extraCountries
        .filter((c) => c !== primaryCountry)
        .map((c) => ({ country: c, isHeadquarters: false, ports: [] })),
    ];
    return {
      companyName,
      primaryCountry,
      yearEstablished: yearEstablished ? Number(yearEstablished) : undefined,
      websiteUrl: websiteUrl || undefined,
      about: about || undefined,
      countriesServed: coverage,
      modes,
      services,
    };
  }

  async function saveDraft(): Promise<boolean> {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/forwarders/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      if (res.ok) {
        setDraftSaved(true);
        return true;
      }
      const data = await res.json().catch(() => null);
      setError(data?.field ? `Please complete: ${data.field}` : "Could not save draft.");
      return false;
    } catch {
      setError("Something went wrong saving your draft.");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function uploadDoc(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!draftSaved) {
      const ok = await saveDraft();
      if (!ok) return;
    }
    setError(null);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("type", "business_registration");
    const res = await fetch("/api/forwarders/draft/documents", { method: "POST", body: fd });
    if (res.status === 201) {
      const doc = await res.json();
      setDocs((d) => [...d, { id: doc.id, name: file.name }]);
    } else if (res.status === 413) {
      setError("That file is too large (max 10 MB).");
    } else {
      setError("Only PDF, JPG, or PNG files are accepted.");
    }
  }

  async function submit() {
    setSubmitting(true);
    setError(null);
    const ok = await saveDraft();
    if (!ok) {
      setSubmitting(false);
      return;
    }
    const res = await fetch("/api/forwarders/draft/submit", { method: "POST" });
    setSubmitting(false);
    if (res.status === 200) {
      setSubmitted(true);
      return;
    }
    const data = await res.json().catch(() => null);
    if (res.status === 403) setError("Verify your email before submitting for review.");
    else if (data?.error === "INCOMPLETE")
      setError(`Still needed: ${(data.missing || []).join(", ")}.`);
    else setError("Could not submit. Please review your details.");
  }

  if (submitted) {
    return (
      <div className="rounded-3xl border border-[var(--color-line)] bg-white p-10 text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-verified-soft)] text-[var(--color-verified)]">
          <CheckCircle size={34} weight="fill" />
        </span>
        <h2 className="mt-5 text-2xl font-bold text-[var(--color-ink)]">
          Submitted for review
        </h2>
        <p className="mx-auto mt-2 max-w-md text-[var(--color-muted)]">
          Our team reviews your documents and coverage. Once approved, your verified
          profile goes live in the directory and starts receiving inquiries.
        </p>
        <Link href="/forwarders" className="mt-6 inline-block">
          <Button variant="secondary">Browse the directory</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!isVerified && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          Verify your email to submit for review. You can fill in your profile now
          and submit once verified.
        </div>
      )}

      {/* Company */}
      <section className="rounded-3xl border border-[var(--color-line)] bg-white p-7">
        <h2 className="text-lg font-semibold text-[var(--color-ink)]">Company details</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Company name" required>
            <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="ACME Logistics GmbH" />
          </Field>
          <Field label="Headquarters country" required>
            <select value={primaryCountry} onChange={(e) => setPrimaryCountry(e.target.value)} className="h-11 w-full cursor-pointer rounded-xl border border-[var(--color-line)] bg-white px-4 text-sm text-[var(--color-ink)] focus:border-[var(--color-accent)] focus:outline-none">
              <option value="">Select a country</option>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </select>
          </Field>
          <Field label="HQ city">
            <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Hamburg" />
          </Field>
          <Field label="Year established">
            <Input type="number" value={yearEstablished} onChange={(e) => setYearEstablished(e.target.value)} placeholder="2009" />
          </Field>
          <Field label="Website">
            <Input value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://acme-logistics.example" />
          </Field>
          <Field label="About" full>
            <textarea value={about} onChange={(e) => setAbout(e.target.value)} rows={3} placeholder="What lanes and services you specialise in." className="w-full rounded-xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-faint)] focus:border-[var(--color-accent)] focus:outline-none" />
          </Field>
        </div>
      </section>

      {/* Coverage */}
      <section className="rounded-3xl border border-[var(--color-line)] bg-white p-7">
        <h2 className="text-lg font-semibold text-[var(--color-ink)]">Coverage & services</h2>
        <p className="mt-1 text-sm text-[var(--color-muted)]">Pick at least one transport mode.</p>

        <Group title="Additional countries served">
          {COUNTRIES.map((c) => (
            <Chip key={c.code} active={extraCountries.includes(c.code)} onClick={() => setExtraCountries((l) => toggle(l, c.code))}>{c.label}</Chip>
          ))}
        </Group>
        <Group title="Transport modes">
          {MODES.map((m) => (
            <Chip key={m.code} active={modes.includes(m.code)} onClick={() => setModes((l) => toggle(l, m.code))}>{m.label}</Chip>
          ))}
        </Group>
        <Group title="Services">
          {SERVICES.map((s) => (
            <Chip key={s.code} active={services.includes(s.code)} onClick={() => setServices((l) => toggle(l, s.code))}>{s.label}</Chip>
          ))}
        </Group>
      </section>

      {/* KYC */}
      <section className="rounded-3xl border border-[var(--color-line)] bg-white p-7">
        <h2 className="text-lg font-semibold text-[var(--color-ink)]">Verification documents</h2>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Upload your business registration or licence. PDF, JPG, or PNG, up to 10 MB.
          These are private and only seen by our review team.
        </p>
        <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-[var(--color-line)] bg-[var(--color-canvas)] py-8 text-sm font-medium text-[var(--color-muted)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]">
          <UploadSimple size={18} />
          Choose a file to upload
          <input type="file" accept="application/pdf,image/jpeg,image/png" className="hidden" onChange={uploadDoc} />
        </label>
        {docs.length > 0 && (
          <ul className="mt-4 space-y-2">
            {docs.map((d) => (
              <li key={d.id} className="flex items-center gap-3 rounded-xl border border-[var(--color-line)] px-4 py-3 text-sm">
                <FilePdf size={18} className="text-[var(--color-accent)]" />
                <span className="flex-1 truncate text-[var(--color-ink)]">{d.name}</span>
                <Badge variant="verified">Uploaded</Badge>
              </li>
            ))}
          </ul>
        )}
      </section>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={submit} size="lg" disabled={submitting || saving}>
          {submitting ? "Submitting…" : "Submit for review"}
        </Button>
        <Button onClick={saveDraft} variant="secondary" size="lg" disabled={saving}>
          {saving ? "Saving…" : "Save draft"}
        </Button>
        {draftSaved && (
          <span className="flex items-center gap-1.5 text-sm text-[var(--color-verified)]">
            <CheckCircle size={16} weight="fill" /> Draft saved
          </span>
        )}
      </div>
    </div>
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

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <h3 className="text-sm font-medium text-[var(--color-muted)]">{title}</h3>
      <div className="mt-2 flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
        active
          ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)]"
          : "border-[var(--color-line)] bg-white text-[var(--color-muted)] hover:border-[var(--color-accent)]"
      }`}
    >
      {children}
    </button>
  );
}
