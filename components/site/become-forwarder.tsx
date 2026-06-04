"use client";

import { Check, Quotes } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/motion/magnetic";
import { Monogram } from "@/components/brand/monogram";

const BENEFITS = [
  "Free to list and pass verification",
  "Inbound inquiries arrive with full lane and cargo detail",
  "You control your coverage, services, and visibility",
];

export function BecomeForwarder() {
  const reduce = useReducedMotion();
  return (
    <section id="for-forwarders" className="px-4 py-24 sm:py-28">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-[var(--color-navy)] px-6 py-16 sm:px-12 lg:px-16">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="max-w-md text-4xl font-semibold leading-tight text-white md:text-5xl">
              List your company. Get qualified inquiries.
            </h2>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-white/70">
              Build a multi-country profile, clear a one-time verification, and
              start receiving shipping inquiries from buyers who searched your
              exact lanes.
            </p>

            <ul className="mt-8 space-y-3">
              {BENEFITS.map((b) => (
                <li key={b} className="flex items-start gap-3 text-white/85">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                    <Check size={13} weight="bold" />
                  </span>
                  <span className="text-[15px]">{b}</span>
                </li>
              ))}
            </ul>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Magnetic>
                <Button size="lg">List your company</Button>
              </Magnetic>
              <a
                href="#how-it-works"
                className="text-sm font-medium text-white/70 transition-colors hover:text-white cursor-pointer"
              >
                How verification works
              </a>
            </div>
          </motion.div>

          {/* Social proof, not a fake product screenshot */}
          <motion.figure
            initial={reduce ? false : { opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="glass-dark relative rounded-3xl p-8"
          >
            <Quotes
              size={40}
              weight="fill"
              className="text-[var(--color-accent)]/60"
            />
            <blockquote className="mt-4 text-xl leading-relaxed text-white">
              We cleared verification in two days and had three real inquiries
              the first week. The lane detail meant we could quote without a
              single back-and-forth.
            </blockquote>
            <figcaption className="mt-6 flex items-center gap-3">
              <Monogram name="Meridian Shipping Rotterdam" size={44} />
              <div>
                <div className="font-[family-name:var(--font-heading)] font-semibold text-white">
                  Mara Velasquez
                </div>
                <div className="text-sm text-white/60">
                  Head of Sales, Meridian Shipping Rotterdam
                </div>
              </div>
            </figcaption>
          </motion.figure>
        </div>
      </div>
    </section>
  );
}
