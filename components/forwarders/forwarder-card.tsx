import Link from "next/link";
import { ArrowRight, ShieldCheck, MapPin } from "@phosphor-icons/react/dist/ssr";
import { Monogram } from "@/components/brand/monogram";
import { Badge } from "@/components/ui/badge";
import { modeLabel, serviceLabel } from "@/lib/taxonomy";
import { countryLabel } from "@/lib/geo";
import type { ForwarderSummary } from "@/lib/forwarders/repository";

export function ForwarderCard({ f }: { f: ForwarderSummary }) {
  return (
    <Link
      href={`/forwarders/${f.slug}`}
      className="group flex flex-col rounded-2xl border border-[var(--color-line)] bg-white p-6 transition-all duration-300 ease-[var(--ease-out-expo)] hover:-translate-y-1 hover:border-[var(--color-accent)]/40 hover:shadow-[0_24px_50px_-24px_rgba(15,23,42,0.25)]"
    >
      <div className="flex items-start justify-between">
        <Monogram name={f.companyName} size={52} />
        {f.verified && (
          <Badge variant="verified">
            <ShieldCheck size={13} weight="fill" />
            Verified
          </Badge>
        )}
      </div>

      <h3 className="mt-5 text-lg font-semibold leading-snug text-[var(--color-ink)]">
        {f.companyName}
      </h3>
      <p className="mt-1 flex items-center gap-1.5 text-sm text-[var(--color-muted)]">
        <MapPin size={15} weight="fill" className="text-[var(--color-faint)]" />
        {countryLabel(f.primaryCountry)}
        <span className="text-[var(--color-faint)]">
          · {f.countriesServed} {f.countriesServed === 1 ? "country" : "countries"}
        </span>
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {f.modes.slice(0, 3).map((m) => (
          <Badge key={m} variant="neutral">
            {modeLabel(m)}
          </Badge>
        ))}
        {f.services[0] && (
          <Badge variant="accent">{serviceLabel(f.services[0])}</Badge>
        )}
      </div>

      <div className="mt-5 flex items-center justify-end border-t border-[var(--color-line)] pt-4">
        <span className="flex items-center gap-1 text-sm font-medium text-[var(--color-accent)]">
          View profile
          <ArrowRight
            size={15}
            weight="bold"
            className="transition-transform duration-200 group-hover:translate-x-0.5"
          />
        </span>
      </div>
    </Link>
  );
}
