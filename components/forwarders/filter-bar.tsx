"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { MagnifyingGlass, CaretDown, X } from "@phosphor-icons/react";
import { MODES, SERVICES } from "@/lib/taxonomy";
import { COUNTRIES } from "@/lib/geo";

function Select({
  label,
  name,
  value,
  options,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  options: Array<{ code: string; label: string }>;
  onChange: (name: string, value: string) => void;
}) {
  return (
    <div className="relative">
      <label className="sr-only" htmlFor={`f-${name}`}>
        {label}
      </label>
      <select
        id={`f-${name}`}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        className="h-11 w-full cursor-pointer appearance-none rounded-xl border border-[var(--color-line)] bg-white pl-4 pr-9 text-sm font-medium text-[var(--color-navy)] transition-colors hover:border-[var(--color-accent)] focus:border-[var(--color-accent)] focus:outline-none"
      >
        <option value="">{label}</option>
        {options.map((o) => (
          <option key={o.code} value={o.code}>
            {o.label}
          </option>
        ))}
      </select>
      <CaretDown
        size={14}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-faint)]"
      />
    </div>
  );
}

export function FilterBar({
  initial,
}: {
  initial: {
    q?: string;
    country?: string;
    mode?: string;
    service?: string;
    originCountry?: string;
    destinationCountry?: string;
  };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = React.useState(initial.q ?? "");

  const push = React.useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [k, v] of Object.entries(updates)) {
        if (v) params.set(k, v);
        else params.delete(k);
      }
      params.delete("page"); // reset to first page on any filter change
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  const onSelect = (name: string, value: string) => push({ [name]: value });

  // debounce the free-text query
  React.useEffect(() => {
    const current = searchParams.get("q") ?? "";
    if (q === current) return;
    const t = setTimeout(() => push({ q }), 350);
    return () => clearTimeout(t);
  }, [q, push, searchParams]);

  const hasFilters =
    !!searchParams.get("country") ||
    !!searchParams.get("mode") ||
    !!searchParams.get("service") ||
    !!searchParams.get("originCountry") ||
    !!searchParams.get("destinationCountry") ||
    !!searchParams.get("q");

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[var(--color-line)] bg-white p-3 shadow-[0_10px_30px_-20px_rgba(15,23,42,0.2)] lg:flex-row lg:items-center">
      <div className="flex flex-1 items-center gap-2 px-2">
        <MagnifyingGlass size={18} className="shrink-0 text-[var(--color-faint)]" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search company name"
          aria-label="Search forwarders by name"
          className="h-11 w-full bg-transparent text-sm text-[var(--color-ink)] placeholder:text-[var(--color-faint)] focus:outline-none"
        />
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:flex">
        <Select label="Country" name="country" value={searchParams.get("country") ?? ""} options={COUNTRIES} onChange={onSelect} />
        <Select label="Mode" name="mode" value={searchParams.get("mode") ?? ""} options={MODES.map((m) => ({ code: m.code, label: m.label }))} onChange={onSelect} />
        <Select label="Service" name="service" value={searchParams.get("service") ?? ""} options={SERVICES.map((s) => ({ code: s.code, label: s.label }))} onChange={onSelect} />
        <Select label="Origin" name="originCountry" value={searchParams.get("originCountry") ?? ""} options={COUNTRIES} onChange={onSelect} />
        <Select label="Destination" name="destinationCountry" value={searchParams.get("destinationCountry") ?? ""} options={COUNTRIES} onChange={onSelect} />
      </div>
      {hasFilters && (
        <button
          type="button"
          onClick={() => {
            setQ("");
            router.push(pathname);
          }}
          className="flex h-11 items-center justify-center gap-1.5 rounded-xl px-4 text-sm font-medium text-[var(--color-muted)] transition-colors hover:text-[var(--color-accent)] cursor-pointer"
        >
          <X size={14} weight="bold" />
          Clear
        </button>
      )}
    </div>
  );
}
