import { Boat } from "@phosphor-icons/react/dist/ssr";

const COLUMNS = [
  {
    heading: "For shippers",
    links: ["Browse directory", "Search by lane", "How it works", "Send an inquiry"],
  },
  {
    heading: "For forwarders",
    links: ["List your company", "Verification", "Forwarder dashboard", "Pricing"],
  },
  {
    heading: "Company",
    links: ["About", "Trust & safety", "Careers", "Contact"],
  },
  {
    heading: "Legal",
    links: ["Privacy", "Terms", "Data requests", "Cookies"],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-line)] bg-white px-4 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div className="max-w-xs">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-navy)] text-white">
                <Boat size={20} weight="fill" />
              </span>
              <span className="font-[family-name:var(--font-heading)] text-lg font-semibold tracking-tight text-[var(--color-ink)]">
                FreightConnect
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-[var(--color-muted)]">
              The directory of verified freight forwarders. Search a lane, find a
              vetted agent, send one structured inquiry.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h4 className="font-[family-name:var(--font-heading)] text-sm font-semibold text-[var(--color-ink)]">
                {col.heading}
              </h4>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-[var(--color-muted)] transition-colors hover:text-[var(--color-accent)] cursor-pointer"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-[var(--color-line)] pt-8 sm:flex-row">
          <p className="text-sm text-[var(--color-faint)]">
            © {new Date().getFullYear()} FreightConnect. All rights reserved.
          </p>
          <p className="text-sm text-[var(--color-faint)]">
            Built for shippers and forwarders worldwide.
          </p>
        </div>
      </div>
    </footer>
  );
}
