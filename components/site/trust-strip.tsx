import { CountUp } from "@/components/motion/count-up";
import { Reveal } from "@/components/motion/reveal";

// Illustrative marketing figures (mock). Replace with live platform metrics.
const STATS = [
  { value: 12400, suffix: "+", label: "Verified forwarders" },
  { value: 181, suffix: "", label: "Countries covered" },
  { value: 30000, suffix: "+", label: "Inquiries routed" },
  { value: 24, suffix: "h", label: "Median reply time" },
];

export function TrustStrip() {
  return (
    <section className="border-y border-[var(--color-line)] bg-white px-4 py-12">
      <Reveal className="mx-auto grid max-w-7xl grid-cols-2 gap-y-8 sm:divide-x sm:divide-[var(--color-line)] lg:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="px-2 text-center sm:px-6">
            <div className="font-[family-name:var(--font-heading)] text-4xl font-semibold text-[var(--color-ink)] md:text-5xl">
              <CountUp value={s.value} suffix={s.suffix} />
            </div>
            <p className="mt-2 text-sm font-medium text-[var(--color-faint)]">
              {s.label}
            </p>
          </div>
        ))}
      </Reveal>
    </section>
  );
}
