# CLAUDE.md — FreightConnect

> This file is loaded into every Claude Code session. Keep it current.
> See @README.md for the human-readable overview and @docs/PRD.md for the product spec.

## Project overview

A two-sided web marketplace where cargo shippers search for and contact verified freight-forwarding agents by country/trade-lane/service, and where forwarders register a vetted multi-country profile to receive inbound shipping inquiries.

**Stack:** TypeScript · Next.js 15 (App Router) · pnpm
**Surfaces:** Web app only (Next.js UI + Route Handlers; no separate backend service, no extension)
**Database:** PostgreSQL + Prisma
**Testing:** Vitest (unit/integration) + Playwright (E2E + browser-verify)
**Deployment:** Railway (one project) — Next app service + Railway Postgres + Railway object-storage bucket (private, for KYC docs) + a cron/worker service for the inquiry email-retry queue. Storage + email sit behind interfaces (`lib/storage`, `lib/email`) with standard env vars, so the host stays swappable.
**Dev URL:** http://localhost:3000

> Greenfield repo. Code does not exist yet — `docs/architecture.md` describes the **target** architecture. Auth = Auth.js (NextAuth) credentials provider with a `role` field.

## Folder layout

```
.
├── app/                  # Next.js App Router — pages + Route Handlers (API)
│   ├── (public)/         # directory, profile, inquiry — SSR, SEO-critical
│   ├── (auth)/           # register, login, verify-email
│   ├── dashboard/        # forwarder-only area (profile edit, inquiries inbox)
│   ├── admin/            # admin-only console (review, moderation, taxonomy)
│   └── api/              # Route Handlers: forwarders, inquiries, admin, auth
├── lib/                  # services, repositories, auth, validation (Zod), email, storage
├── prisma/               # schema.prisma + migrations (never edit applied migrations)
├── components/           # shadcn/ui + app components
├── tests/                # unit + integration (Vitest)
├── e2e/                  # Playwright specs (critical flows only)
├── docs/                 # PRD, architecture, conventions, test-strategy, known-pitfalls, skill-routing
└── .claude/              # subagents, commands, hooks, state
```

Deeper context:
- Product spec: @docs/PRD.md
- Architecture & data model: @docs/architecture.md
- Code conventions: @docs/conventions.md
- Testing strategy: @docs/test-strategy.md
- **Known pitfalls: @docs/known-pitfalls.md** ← read this before starting any task
- **Skill routing: @docs/skill-routing.md** ← read this before delegating, declaring done, or starting non-trivial work

## Commands

```bash
pnpm install            # install dependencies
pnpm dev                # run dev server (http://localhost:3000)
pnpm build              # production build
pnpm test               # run tests (Vitest)
pnpm typecheck          # type check (tsc --noEmit)
pnpm lint               # lint (eslint)
```

**Dev/watch convention:** start with output captured so the smoke-check hook can read it:

```bash
pnpm dev 2>&1 | tee .claude/dev-server.log
```

Prefer running **single tests** over the whole suite when iterating — faster feedback.

## Slash commands

- `/plan` — produce a written plan before any non-trivial change. Get approval, then build.
- `/review` — invoke the **code-reviewer** subagent on the current diff.
- `/verify` — invoke the **browser-verifier** subagent on the web routes you just touched. Captures console errors + screenshots from real browser runs via Playwright MCP.
- `/ship` — run the full **production-readiness** check (Lighthouse, bundle, a11y, security headers, secrets) before deploy.

## Subagents

- **code-reviewer** — read-only review of current diff against conventions
- **test-runner** — runs tests, interprets failures, suggests fixes (does NOT modify files)
- **browser-verifier** — drives Playwright MCP, navigates routes, reads console errors, screenshots
- **production-readiness** — pre-deploy gate: bundle size, Lighthouse, a11y, security headers, secrets

Use these via the `Task` tool. They run in their own context — main context stays clean.

## Non-negotiable rules

These are hard rules. Violating them blocks merge.

1. **Approval gates visibility.** A `ForwarderProfile` is publicly visible (directory F1, profile F2) **only** when `status = approved`. `draft` / `pending` / `rejected` / `suspended` must never appear in any public query or payload.
2. **KYC documents are private.** Never expose a KYC document on any public endpoint or public payload. Store in a private bucket; serve only via short-lived (≤5 min) signed URLs from admin-only code. `verified=true` implies `status=approved`.
3. **Identity from the session, never the client.** Derive `ownerUserId` (and any tenant/owner scoping) from the authenticated session. Never trust a client-supplied `ownerId`/`userId` in a body or query.
4. **Admin role enforced server-side.** Every `/admin/*` page and `/api/admin/*` handler checks the admin role on the server. Hiding UI is not access control.
5. **Auth hygiene.** Hash passwords (argon2 or bcrypt) — never plaintext. Session cookies are `httpOnly`, `secure`, `sameSite=lax`. Auth errors must not enable user enumeration (identical message + timing for unknown-email vs wrong-password).
6. **Persist before side effects.** Persist an `Inquiry` before attempting any email send; a provider failure must never lose a lead (queue + retry). Use an idempotency key to prevent duplicate inquiries on retry/double-click.
7. **Filter state lives in the URL.** Directory filters are query-string driven (shareable + back-button safe), not component-only state.
8. **Slugs are server-generated, unique, immutable once approved.** Resolve collisions with `-2`, `-3` suffixes.
9. **Validate uploads on the server.** Content-type + size enforced server-side; accept only pdf/jpg/png; 10 MB max.
10. **Index every filter column.** `status`, `country`, `mode`, `service` and lane columns must be indexed — list queries degrade without it.
11. **Secrets stay server-side.** All provider keys in env/secret store. Never in the client bundle; never behind `NEXT_PUBLIC_`.
12. **Never edit an applied Prisma migration.** Add a new migration instead.

## How to work in this repo

1. **Read `@docs/known-pitfalls.md` before starting.** It exists so you don't repeat the same mistakes.
2. **Read `@docs/skill-routing.md` before non-trivial work.** It defines which skills MUST run for which triggers in this project.
3. **Plan before coding.** For any non-trivial change, use `/plan` to produce a plan listing affected files, acceptance criteria, and test approach. Get approval before implementing.
4. **Match existing patterns.** Before adding a new pattern, search the codebase — if a similar pattern already exists, use it.
5. **Verify, don't assume.** After editing code, always run `pnpm typecheck` and `pnpm test`. For web-runtime changes, run `/verify` on the affected routes before claiming done.
6. **Update known-pitfalls.md.** When you debug a non-obvious issue, add an entry to `@docs/known-pitfalls.md` so future sessions don't pay the same cost.
7. **Small, focused commits.** One logical change per commit. Descriptive messages.

## Definition of done

A task is **NOT** complete until ALL applicable checks below pass. Do not claim "done" in chat without producing the evidence pack.

### Always required (every change)
1. ✅ `pnpm typecheck` exits 0
2. ✅ `pnpm lint` exits 0
3. ✅ Relevant tests pass (`pnpm test` or focused single test)
4. ✅ One-line summary of WHAT changed and WHY

### For changes that affect web runtime behavior (UI, Route Handlers, browser-rendered pages)
5. ✅ Ran `/verify` on every affected route
6. ✅ Console errors on those routes: zero
7. ✅ Network errors: zero unexpected 4xx/5xx
8. ✅ Screenshot path attached for the working state

**Evidence template (web):**
```
✅ Typecheck: pass
✅ Lint: pass
✅ Tests: <X passed>
✅ /verify: <route(s) checked>, console errors: 0, screenshot: .claude/screenshots/<name>.png
Summary: <one line>
```

### For changes to API Route Handlers or service code
5. ✅ Integration tests pass for affected endpoints
6. ✅ Response shape matches the PRD data contract (see @docs/PRD.md §4)
7. ✅ Error paths return the documented error envelope (e.g. `{ error: "INVALID_FILTER", field }`)

**If any check fails or you can't produce evidence, say so explicitly.** Do not paper over it. Do not claim done.

## Skill Routing (mandatory)

Skill invocation rules for this project are defined in **@docs/skill-routing.md**. Read that file before starting any non-trivial coding task. The rules in it are not suggestions — they're enforced by:

- `.claude/hooks/stop-verify.sh` — soft warning at end of any turn that edited source without running verification
- `.claude/hooks/pre-commit-gate.sh` — hard block on `git commit` when staged source files were edited after the last verification run

The `@-reference` loads the routing file into context on demand. If you're working on something where routing might apply (writing code, delegating to a subagent, declaring a task done), read `@docs/skill-routing.md` first.

**Override:** `git commit --no-verify` bypasses the pre-commit gate. Use it only for docs-only or config-only commits where no source verification applies. Every override is logged.

## Known pitfalls — read me before coding

The full list is at `@docs/known-pitfalls.md`. Some highlights you should already know:

- **Hydration mismatches** — no `Date.now()` / `Math.random()` / `window` in server-render paths; compute on server and pass as props.
- **Missing `"use client"`** — any file using hooks, event handlers, or browser APIs needs it.
- **Directory leaking non-approved profiles** — every public query filters `status = approved`; this is the #1 trust bug.
- **KYC doc exposed on public payload** — the public `/api/forwarders/:slug` projection must whitelist fields; never spread the entity.
- **Inquiry lost on email failure** — persist first, then send; queue + retry on provider error.
- **Trusting client `ownerId`** — always derive owner/tenant from session.

## Workflow preferences

- When compacting context, **always preserve** the list of modified files, the most recent `/verify` output, and pending test commands.
- For open-ended investigations, use subagents (`Task` tool) so the main context stays clean.
- If something looks wrong, ask a clarifying question rather than guessing.
- If a hook surfaces an error after you finish, **address it in the next turn — do not declare done.**
