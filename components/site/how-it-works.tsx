import { MagnifyingGlass, ShieldCheck, PaperPlaneTilt } from "@phosphor-icons/react/dist/ssr";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";

const STEPS = [
  {
    icon: MagnifyingGlass,
    title: "Search the lane you ship",
    body: "Filter by country, port, transport mode, and service to shortlist agents that fit your exact route.",
  },
  {
    icon: ShieldCheck,
    title: "Compare verified profiles",
    body: "Every listed forwarder passed a document-based KYC review. The verified badge is earned, not bought.",
  },
  {
    icon: PaperPlaneTilt,
    title: "Send a structured inquiry",
    body: "Share your lane and cargo once. The forwarder replies with a quote directly to your inbox.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="px-4 py-24 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <Reveal className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent)]">
            How it works
          </p>
          <h2 className="mt-3 text-4xl font-semibold text-[var(--color-ink)] md:text-5xl">
            From open lane to quoted in three steps.
          </h2>
        </Reveal>

        <Stagger className="relative mt-16 grid gap-12 md:grid-cols-3 md:gap-8">
          {/* connecting line across the row (desktop) */}
          <div
            aria-hidden
            className="absolute left-0 right-0 top-7 hidden h-px bg-[var(--color-line)] md:block"
          />
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <StaggerItem key={step.title} className="relative">
                <div className="flex items-center gap-4 md:gap-0">
                  <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-navy)] text-white">
                    <Icon size={24} weight="duotone" />
                  </div>
                </div>
                <h3 className="mt-5 text-xl font-semibold text-[var(--color-ink)]">
                  {step.title}
                </h3>
                <p className="mt-2 max-w-xs text-[15px] leading-relaxed text-[var(--color-muted)]">
                  {step.body}
                </p>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
