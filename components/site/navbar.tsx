"use client";

import * as React from "react";
import { motion, useScroll, useMotionValueEvent } from "motion/react";
import { Boat, List, X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/motion/magnetic";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Directory", href: "#featured" },
  { label: "For forwarders", href: "#for-forwarders" },
];

export function Navbar() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 12));

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-0 z-50 px-4 pt-4"
    >
      <nav
        className={cn(
          "mx-auto flex h-16 max-w-7xl items-center justify-between rounded-full px-3 pl-5 transition-all duration-300",
          scrolled ? "glass" : "bg-transparent",
        )}
      >
        <a href="#top" className="flex items-center gap-2.5 cursor-pointer">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-navy)] text-white">
            <Boat size={20} weight="fill" />
          </span>
          <span className="font-[family-name:var(--font-heading)] text-lg font-semibold tracking-tight text-[var(--color-ink)]">
            FreightConnect
          </span>
        </a>

        <div className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-[var(--color-muted)] transition-colors duration-200 hover:bg-white/60 hover:text-[var(--color-ink)] cursor-pointer"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <a
            href="#"
            className="hidden text-sm font-medium text-[var(--color-muted)] transition-colors hover:text-[var(--color-ink)] sm:block cursor-pointer"
          >
            Sign in
          </a>
          <div className="hidden sm:block">
            <Magnetic>
              <Button size="sm">List your company</Button>
            </Magnetic>
          </div>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--color-ink)] hover:bg-white/60 lg:hidden cursor-pointer"
          >
            {open ? <X size={22} /> : <List size={22} />}
          </button>
        </div>
      </nav>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="glass mx-auto mt-2 max-w-7xl rounded-3xl p-4 lg:hidden"
        >
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-2xl px-4 py-3 text-sm font-medium text-[var(--color-muted)] hover:bg-white/60 hover:text-[var(--color-ink)] cursor-pointer"
              >
                {link.label}
              </a>
            ))}
            <Button className="mt-2 w-full">List your company</Button>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}
