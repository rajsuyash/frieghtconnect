import Link from "next/link";
import { Boat } from "@phosphor-icons/react/dist/ssr";

const COLUMNS = [
  {
    heading: "For shippers",
    links: [
      { label: "Browse directory", href: "/forwarders" },
      { label: "Search by lane", href: "/forwarders" },
      { label: "How it works", href: "/#how-it-works" },
      { label: "Send an inquiry", href: "/forwarders" },
    ],
  },
  {
    heading: "For forwarders",
    links: [
      { label: "List your company", href: "/register/forwarder" },
      { label: "Verification", href: "/#how-it-works" },
      { label: "Forwarder dashboard", href: "/dashboard" },
      { label: "Pricing", href: "/register/forwarder" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/" },
      { label: "Trust & safety", href: "/#how-it-works" },
      { label: "Careers", href: "/" },
      { label: "Contact", href: "/" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy", href: "/" },
      { label: "Terms", href: "/" },
      { label: "Data requests", href: "/" },
      { label: "Cookies", href: "/" },
    ],
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
                Global Trade Collective
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
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--color-muted)] transition-colors hover:text-[var(--color-accent)] cursor-pointer"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-[var(--color-line)] pt-8 sm:flex-row">
          <p className="text-sm text-[var(--color-faint)]">
            © {new Date().getFullYear()} Global Trade Collective. All rights reserved.
          </p>
          <p className="text-sm text-[var(--color-faint)]">
            Built for shippers and forwarders worldwide.
          </p>
        </div>
      </div>
    </footer>
  );
}
