# Postmortem: FreightConnect

**Date shipped:** 2026-06-04
**Live URL:** https://freightconnect-app-production.up.railway.app
**Host:** Railway (app + Postgres + volume for KYC)

## What was built

A verified freight-forwarder marketplace (PRD `docs/PRD.md`), shipped P0 end to end:
register → verify email → build forwarder profile → upload KYC → submit (pending)
→ admin reviews + approves → profile goes live (verified) in the directory →
shipper searches/filters → opens profile → sends a structured inquiry → forwarder notified.

7 phases, 11 commits, ~5,800 LOC, 55 tests (unit + DB integration), 9 pages, 12 API routes.
Stack: Next.js 15 (App Router) + Prisma 6 + Postgres + Auth.js v5 + Tailwind v4 + d3-geo globe.

## What worked

- **Phased TDD per feature** (foundation → directory/profile → auth → registration/KYC → inquiry → admin). Tests-first caught the contract early; each phase shipped green and committed.
- **Invariants enforced + tested**: approved-only public reads, KYC private/signed-URL only, session-derived identity, server-side admin gate, persist-inquiry-before-email, rate limit + idempotency.
- **HTTP-level verification with a real NextAuth session** (cookie jar) proved the auth-gated flows deterministically when the browser tool dropped sessions.
- **d3-geo canvas globe** after WebGL/react-globe.gl failed in headless — lighter, verifiable, no GPU dependency.

## What bloated / went sideways

- **Railway build fought us for 5 deploys**: (1) Next.js CVE gate forced 15.5.4 → 15.5.19; (2) `@tailwindcss/oxide` native binding unresolvable under Nixpacks + pnpm (frozen-lockfile + store cache + optional-dep filtering). supportedArchitectures, hoisted linker, non-frozen install, and pinned optionalDeps all failed. **A Dockerfile (node:22-slim + fresh pnpm install) fixed it deterministically.**
- Globe was rebuilt 3× (SVG → react-globe.gl/WebGL → d3-geo canvas) chasing the SeaRates look.

## One mistake I made

Started the Railway deploy on Nixpacks and burned 5 build cycles on the Tailwind v4 oxide native-binding issue before switching to a Dockerfile — which I should have reached for after the second failure.

## One pattern to reuse

For Tailwind v4 + pnpm on any container host: skip Nixpacks, use a Dockerfile with a fresh (non-frozen) pnpm install on a glibc base image. Deterministic native bindings, no cache surprises.

## Karpathy rule I leaned on

"Goal-driven execution": every phase had verifiable success criteria (specific HTTP status codes + DB invariants), which let each phase loop to green independently without re-litigating scope.

## Deferred (not built)

P1: F7 forwarder dashboard, F8 lane-search UI. P2: F9 reviews. Email retry worker (inline send for now). Resend not yet wired (email logs to server until `RESEND_API_KEY` is set).
