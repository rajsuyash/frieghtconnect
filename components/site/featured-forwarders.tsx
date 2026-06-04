import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { ForwarderCard } from "@/components/site/forwarder-card";
import { FEATURED_FORWARDERS } from "@/lib/data/forwarders";

export function FeaturedForwarders() {
  return (
    <section id="featured" className="bg-white px-4 py-24 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <h2 className="text-4xl font-semibold text-[var(--color-ink)] md:text-5xl">
              Recently verified forwarders
            </h2>
            <p className="mt-3 text-lg text-[var(--color-muted)]">
              A sample of agents that cleared review this month.
            </p>
          </div>
          <Link
            href="/forwarders"
            className="flex items-center gap-1.5 rounded-full border border-[var(--color-line)] px-5 py-2.5 text-sm font-medium text-[var(--color-navy)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] cursor-pointer"
          >
            Browse all forwarders
            <ArrowRight size={15} weight="bold" />
          </Link>
        </Reveal>

        <Stagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURED_FORWARDERS.map((f) => (
            <StaggerItem key={f.slug}>
              <ForwarderCard f={f} />
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
