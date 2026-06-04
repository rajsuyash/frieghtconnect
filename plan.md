# FreightConnect — Build Plan (prd-to-ship)

North star: searates.com (experience, not its rate/tracking/booking scope). Deploy: Railway.

## Phases (serial — shared Prisma schema/lib makes parallel risky)

1. **Foundation** — Prisma schema (all §5 entities) + migration + seed (taxonomy + ~12 approved forwarders) + Zod schemas + db client + slug-gen + status transitions. Success: `prisma validate`/`generate` ok, Vitest unit tests green (slug, status, zod), typecheck+lint.
2. **Auth & roles (F6)** — Auth.js v5 credentials, register/login/verify-email, argon2, httpOnly cookies, server role guards, Resend verify mail. Success: register→verify→login + 409/401/role-guard tests.
3. **Directory + Profile (F1+F2)** — /forwarders filter+grid (URL-driven, approved-only, 400 invalid filter), /forwarders/[slug] SSR + whitelisted projection (404 unknown). SeaRates /tools pattern. Success: integration + browser-verify.
4. **Registration + KYC (F3)** — onboarding wizard, POST/PATCH, doc upload to Railway bucket (server validation, ≤10MB pdf/jpg/png), submit→pending. Success: 201/400/413/403/401 tests + browser-verify.
5. **Inquiry (F4)** — form on profile, persist-before-email, rate-limit (429), idempotency, honeypot, Resend notify. Success: tests + browser-verify.
6. **Admin console (F5)** — /admin/* server role-gated, approve/reject(reason)/suspend, KYC signed URLs, audit log. Success: tests + browser-verify.
7. **Ship to Railway** — provision app + Postgres + private bucket + cron worker, env, deploy, smoke the end-to-end loop.

Deferred (P1/P2): F7 dashboard, F8 lane search, F9 reviews.

## Per-phase loop
TDD (tests first) → implement → inline code-review (fix CRITICAL+HIGH) → verify (typecheck+lint+test, browser-verify for UI) → commit.

## Hard invariants (from CLAUDE.md)
approved-only public reads · KYC private + signed-URL only · identity from session · admin server-side · persist-inquiry-before-email · URL-driven filters · server-side upload validation · indexed filter cols · no NEXT_PUBLIC_ secrets · append-only migrations.
