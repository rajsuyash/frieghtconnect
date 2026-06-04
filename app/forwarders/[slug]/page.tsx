import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  MapPin,
  Globe,
  Path,
  CaretLeft,
  PaperPlaneTilt,
  Buildings,
} from "@phosphor-icons/react/dist/ssr";
import { Monogram } from "@/components/brand/monogram";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getForwarderBySlug } from "@/lib/forwarders/repository";
import { modeLabel, serviceLabel } from "@/lib/taxonomy";
import { countryLabel } from "@/lib/geo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const f = await getForwarderBySlug(slug);
  if (!f) return { title: "Forwarder not found — FreightConnect" };
  return {
    title: `${f.companyName} — verified freight forwarder`,
    description: `${f.companyName}, a verified forwarder based in ${countryLabel(f.primaryCountry)}. View coverage, modes, and send an inquiry.`,
  };
}

// Per-request data (DB + session) — never prerender at build.
export const dynamic = "force-dynamic";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const f = await getForwarderBySlug(slug);
  if (!f) notFound();

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <Link
        href="/forwarders"
        className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-muted)] transition-colors hover:text-[var(--color-accent)]"
      >
        <CaretLeft size={14} weight="bold" />
        Back to directory
      </Link>

      {/* header */}
      <div className="mt-6 flex flex-col gap-6 rounded-3xl border border-[var(--color-line)] bg-white p-8 sm:flex-row sm:items-start">
        <Monogram name={f.companyName} size={88} rounded="rounded-2xl" />
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-[var(--color-ink)]">
              {f.companyName}
            </h1>
            {f.verified && (
              <Badge variant="verified" size="md" data-testid="verified-badge">
                <ShieldCheck size={15} weight="fill" />
                Verified
              </Badge>
            )}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[var(--color-muted)]">
            <span className="flex items-center gap-1.5">
              <MapPin size={16} weight="fill" className="text-[var(--color-faint)]" />
              {countryLabel(f.primaryCountry)}
            </span>
            {f.yearEstablished && (
              <span className="flex items-center gap-1.5">
                <Buildings size={16} weight="fill" className="text-[var(--color-faint)]" />
                Since {f.yearEstablished}
              </span>
            )}
            {f.websiteUrl && (
              <a
                href={f.websiteUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="flex items-center gap-1.5 text-[var(--color-accent)] hover:underline"
              >
                <Globe size={16} weight="fill" />
                Website
              </a>
            )}
          </div>
          {f.about && (
            <p className="mt-4 max-w-2xl leading-relaxed text-[var(--color-muted)]">
              {f.about}
            </p>
          )}
        </div>
        <Link href="#inquiry" className="shrink-0">
          <Button size="lg">
            <PaperPlaneTilt size={18} weight="fill" />
            Send inquiry
          </Button>
        </Link>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* coverage */}
        <section className="rounded-3xl border border-[var(--color-line)] bg-white p-7 lg:col-span-2">
          <h2 className="text-lg font-semibold text-[var(--color-ink)]">
            Countries served
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {f.countries.map((c, i) => (
              <li
                key={`${c.country}-${i}`}
                className="rounded-2xl border border-[var(--color-line)] p-4"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-[var(--color-ink)]">
                    {countryLabel(c.country)}
                  </span>
                  {c.isHeadquarters && <Badge variant="accent">HQ</Badge>}
                </div>
                {c.city && (
                  <p className="mt-1 text-sm text-[var(--color-muted)]">{c.city}</p>
                )}
                {c.ports.length > 0 && (
                  <p className="mt-2 text-xs font-medium text-[var(--color-faint)]">
                    Ports: {c.ports.join(", ")}
                  </p>
                )}
              </li>
            ))}
          </ul>

          {f.lanes.length > 0 && (
            <>
              <h2 className="mt-8 text-lg font-semibold text-[var(--color-ink)]">
                Trade lanes
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {f.lanes.map((l, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-2 rounded-full border border-[var(--color-line)] bg-[var(--color-canvas)] px-3 py-1.5 text-sm font-medium text-[var(--color-navy)]"
                  >
                    {countryLabel(l.originCountry)}
                    <Path size={13} className="text-[var(--color-accent)]" />
                    {countryLabel(l.destinationCountry)}
                  </span>
                ))}
              </div>
            </>
          )}
        </section>

        {/* services + modes */}
        <aside className="space-y-6">
          <div className="rounded-3xl border border-[var(--color-line)] bg-white p-7">
            <h2 className="text-lg font-semibold text-[var(--color-ink)]">
              Transport modes
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {f.modes.map((m) => (
                <Badge key={m} variant="neutral" size="md">
                  {modeLabel(m)}
                </Badge>
              ))}
            </div>
          </div>
          {f.services.length > 0 && (
            <div className="rounded-3xl border border-[var(--color-line)] bg-white p-7">
              <h2 className="text-lg font-semibold text-[var(--color-ink)]">
                Services
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {f.services.map((s) => (
                  <Badge key={s} variant="accent" size="md">
                    {serviceLabel(s)}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* inquiry entry point — form wired in the inquiry phase */}
      <section
        id="inquiry"
        className="mt-6 overflow-hidden rounded-3xl bg-[var(--color-navy)] px-8 py-10 text-white"
      >
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-semibold text-white">
              Send a structured inquiry to {f.companyName}
            </h2>
            <p className="mt-2 max-w-xl text-white/70">
              Share your lane and cargo once. {f.companyName} replies with a quote
              directly to your inbox.
            </p>
          </div>
          <Link href={`/forwarders/${f.slug}/inquiry`} className="shrink-0">
            <Button size="lg">
              <PaperPlaneTilt size={18} weight="fill" />
              Start inquiry
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
