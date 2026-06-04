# Testing Strategy — FreightConnect

> Defines what "done" means and how Claude Code should verify its own work.

## Test pyramid (extended)

| Layer | Framework | Lives in | What gets tested here |
|-------|-----------|----------|----------------------|
| Unit | Vitest | `tests/` or co-located `*.test.ts` | Pure functions, validation (Zod), slug generation, status-transition logic |
| Integration | Vitest + test Postgres | `tests/` | Route Handler request/response, service ↔ DB, email/storage mocked at boundary |
| E2E | Playwright | `e2e/*.spec.ts` | 3–8 critical flows only (see below) |
| **Browser verification** | Playwright MCP (browser-verifier subagent) | runtime, no test file | **Per-change UAT** — read console, screenshot, confirm route renders |

The browser-verification layer runs **during development**, not in CI — every time Claude Code finishes a runtime change it self-verifies with `/verify` before declaring done. This kills the manual screenshot loop.

## Commands

```bash
pnpm test                    # all tests (Vitest)
pnpm test --watch            # watch mode while iterating
pnpm test --coverage         # with coverage report
pnpm test <pattern>          # run a single file / pattern
pnpm exec playwright test    # E2E suite
```

For browser verification: `/verify` (slash command) or invoke the `browser-verifier` subagent via the Task tool.

**Always prefer running single tests while iterating** — full suites waste context tokens and time.

## What to test at each layer

### Unit tests
✅ Always test:
- Zod schemas (valid + invalid filter params, bodies, upload constraints)
- Slug generation + collision suffixing
- Status transitions (draft→pending→approved/rejected; suspend)
- The public projection helper (asserts KYC + internal fields are NOT present)
- Error paths, not just happy paths

❌ Don't unit-test third-party internals or trivial pass-throughs.

### Integration tests
✅ `/api/forwarders` filtering + pagination + `400` on invalid filter
✅ Approval gate: a `pending`/`rejected`/`suspended` profile never appears in directory or `/api/forwarders/:slug`
✅ Auth: `401` unauthenticated, `403` cross-tenant (forwarder A editing forwarder B), `403` non-admin on `/api/admin/*`
✅ Inquiry: persisted before email; email provider called with correct recipient (mocked); `429` after rate-limit threshold; idempotency key prevents duplicates
✅ Upload: `413` over 10 MB; reject non pdf/jpg/png
✅ KYC doc reachable only via signed URL; public payload omits it

### E2E tests (write sparingly — the 3–8 that matter)
1. Forwarder register → build profile → upload KYC → submit (status pending)
2. Admin login → review queue → approve → profile becomes public/verified
3. Shipper directory search (country + mode) → open profile → send inquiry
4. Auth: register → email-verify gate → login
5. Access control: non-admin blocked from `/admin/*`

❌ Don't E2E-test what a unit/integration test covers — too slow + brittle.

### Browser verification (per-change, ad-hoc)
- Run `/verify` after every UI/Route-Handler/runtime change
- The browser-verifier navigates, reads console, screenshots
- Output goes into the "evidence pack" required by Definition of Done
- Not CI — it's interactive QA that closes the loop within Claude Code

## Coverage bar

- Minimum: **80%** statement coverage on changed files
- Critical modules (auth, admin verification, inquiry persistence, KYC/signed URLs): **90%**
- Don't chase 100% — test the behavior that matters.

## Fixtures & mocks

- Shared test fixtures live in `tests/fixtures/`
- Mock email + storage + captcha at the client boundary; never mock the thing under test
- Use a disposable test Postgres (or a transaction-per-test rollback) for integration tests

## CI

Tests run on every PR. A PR is not merged until:
1. All tests pass
2. `pnpm typecheck` passes
3. `pnpm lint` passes
4. Coverage on changed files ≥ 80%

Browser verification is **not** part of CI — it's a developer-time check. CI uses the Playwright E2E suite for regression coverage.

## Definition of done (for Claude Code)

Before claiming a task complete, Claude must have:

1. ✅ Run the relevant tests and confirmed they pass
2. ✅ Run `pnpm typecheck` with zero errors
3. ✅ Run `pnpm lint` with zero errors
4. ✅ For UI/runtime changes: run `/verify`, attach screenshot path, confirm zero console errors
5. ✅ Added tests for any new public behavior
6. ✅ Updated docs if a public API/contract changed
7. ✅ Added an entry to @docs/known-pitfalls.md if a non-obvious bug was resolved

Evidence block (paste in the "done" message):

```
✅ Typecheck: pass
✅ Lint: pass
✅ Tests: <N passed>
✅ Browser verify: <route(s) checked>, console errors: 0, screenshot: <path>
Summary: <one line>
```
