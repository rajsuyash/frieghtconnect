"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  MagnifyingGlass,
  MapPin,
  ArrowsLeftRight,
  CaretDown,
  ShieldCheck,
  Path,
  Stack,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Globe } from "@/components/site/globe";
import { FILTER_MODES } from "@/lib/data/forwarders";

const EASE = [0.16, 1, 0.3, 1] as const;

const TABS = [
  { id: "lane", label: "By trade lane", icon: Path },
  { id: "location", label: "By location", icon: MapPin },
  { id: "service", label: "By service", icon: Stack },
];

export function Hero() {
  const reduce = useReducedMotion();
  const [tab, setTab] = React.useState("lane");
  const [origin, setOrigin] = React.useState("");
  const [destination, setDestination] = React.useState("");
  const [mode, setMode] = React.useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (origin) params.set("origin", origin);
    if (destination) params.set("destination", destination);
    if (mode) params.set("mode", mode);
    window.location.href = `/forwarders?${params.toString()}`;
  }

  function swap() {
    setOrigin(destination);
    setDestination(origin);
  }

  const rise = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 26 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay, ease: EASE },
  });

  const single = tab !== "lane";

  return (
    <section
      id="top"
      className="relative flex min-h-[100dvh] items-center overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#eef4fc_100%)] px-4 pt-28 pb-16"
    >
      {/* faint top-right glow */}
      <div className="pointer-events-none absolute right-0 top-0 h-[60vh] w-[60vw] rounded-full bg-[radial-gradient(circle,rgba(3,105,161,0.08),transparent_60%)]" />

      {/* globe: large, drifting off the right edge */}
      <div className="pointer-events-none absolute right-[-14%] top-1/2 hidden w-[64vw] max-w-[820px] -translate-y-1/2 lg:block">
        <Globe />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <div className="max-w-2xl">
          <motion.div
            {...rise(0)}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-line)] bg-white/70 px-3 py-1.5 text-xs font-medium text-[var(--color-muted)] backdrop-blur-sm"
          >
            <ShieldCheck
              size={14}
              weight="fill"
              className="text-[var(--color-verified)]"
            />
            12,400+ verified forwarders. Free to search.
          </motion.div>

          <motion.h1
            {...rise(0.08)}
            className="mt-6 text-5xl font-bold leading-[1.02] tracking-tight text-[var(--color-ink)] sm:text-6xl lg:text-7xl"
          >
            Find a{" "}
            <span className="text-[var(--color-accent)]">verified</span>
            <br />
            freight forwarder.
          </motion.h1>

          <motion.p
            {...rise(0.16)}
            className="mt-5 max-w-md text-lg leading-relaxed text-[var(--color-muted)]"
          >
            Search vetted agents by trade lane, country, and service, then send
            one structured inquiry.
          </motion.p>

          {/* tabs */}
          <motion.div {...rise(0.24)} className="mt-9 flex flex-wrap gap-2">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className="relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors cursor-pointer"
                >
                  {active && (
                    <motion.span
                      layoutId="tab-pill"
                      className="absolute inset-0 rounded-full bg-[var(--color-navy)]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span
                    className={`relative z-10 flex items-center gap-2 ${
                      active ? "text-white" : "text-[var(--color-muted)]"
                    }`}
                  >
                    <Icon size={16} weight={active ? "fill" : "regular"} />
                    {t.label}
                  </span>
                </button>
              );
            })}
          </motion.div>

          {/* search bar */}
          <motion.form
            {...rise(0.3)}
            onSubmit={submit}
            className="mt-3 flex flex-col gap-2 rounded-2xl border border-[var(--color-line)] bg-white p-2 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.25)] md:flex-row md:items-center"
          >
            <div className="flex flex-1 items-center gap-2 px-3">
              <MapPin size={18} weight="fill" className="shrink-0 text-[var(--color-accent)]" />
              <input
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder={single ? "Country, port, or service" : "Origin country or port"}
                aria-label={single ? "Search" : "Origin"}
                className="h-11 w-full bg-transparent text-sm text-[var(--color-ink)] placeholder:text-[var(--color-faint)] focus:outline-none"
              />
            </div>

            {!single && (
              <>
                <button
                  type="button"
                  onClick={swap}
                  aria-label="Swap origin and destination"
                  className="mx-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--color-line)] text-[var(--color-faint)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] cursor-pointer"
                >
                  <ArrowsLeftRight size={16} />
                </button>
                <div className="flex flex-1 items-center gap-2 px-3 md:border-l md:border-[var(--color-line)]">
                  <MapPin size={18} weight="fill" className="shrink-0 text-[var(--color-verified)]" />
                  <input
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Destination country or port"
                    aria-label="Destination"
                    className="h-11 w-full bg-transparent text-sm text-[var(--color-ink)] placeholder:text-[var(--color-faint)] focus:outline-none"
                  />
                </div>
              </>
            )}

            <div className="relative md:border-l md:border-[var(--color-line)]">
              <label className="sr-only" htmlFor="hero-mode">
                Transport mode
              </label>
              <select
                id="hero-mode"
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="h-11 w-full cursor-pointer appearance-none rounded-xl bg-transparent pl-3 pr-9 text-sm font-medium text-[var(--color-navy)] focus:outline-none md:w-40"
              >
                <option value="">Any mode</option>
                {FILTER_MODES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <CaretDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-faint)]"
              />
            </div>

            <Button type="submit" size="lg" className="md:px-7">
              <MagnifyingGlass size={18} weight="bold" />
              Search
            </Button>
          </motion.form>
        </div>
      </div>
    </section>
  );
}
