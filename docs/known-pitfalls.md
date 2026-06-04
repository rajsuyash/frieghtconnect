# Known pitfalls — FreightConnect

<!--
Living document. Read before starting any task. Add to it after every painful debug session.
Each entry: Symptom (what you see) / Cause (why) / Fix (concrete remedy).
Surfaces in this project: Web app only (Next.js App Router + Prisma/Postgres).
-->

> **For Claude Code:** if you hit a non-obvious bug and resolve it, append an entry to the right section. The next session reads this file before starting any task.

---

## Next.js / React pitfalls

### Hydration mismatch
- **Symptom:** Console: "Text content does not match server-rendered HTML" / "Hydration failed".
- **Cause:** `Date.now()`, `Math.random()`, `new Date()`, or `window`/`localStorage` used in a render path that runs on both server and client.
- **Fix:** Compute the value once on the server and pass it as a prop, or move the component behind a `"use client"` boundary and compute in `useEffect`.

### Missing `"use client"`
- **Symptom:** Build/runtime error: "You're importing a component that needs useState/useEffect/onClick…".
- **Cause:** A file using hooks, event handlers, or browser APIs is treated as a Server Component.
- **Fix:** Add `"use client"` at the top. Keep it as low in the tree as possible to preserve SSR for the rest.

### Server Component passing a function/class instance as a prop
- **Symptom:** "Functions cannot be passed directly to Client Components".
- **Cause:** A Server Component handed a Client Component a callback or non-serializable value.
- **Fix:** Pass serializable data only; move the handler into the Client Component, or wrap in a Server Action.

### Route Handler vs Server Action confusion
- **Symptom:** Form posts 404, or mutation runs twice.
- **Cause:** Mixing a `<form action>` Server Action with a fetch to a Route Handler.
- **Fix:** Pick one per flow. Public JSON API → Route Handler under `app/api/`. Internal form mutation → Server Action. Document which in the feature.

### `NEXT_PUBLIC_` secret exposure
- **Symptom:** An API key shows up in the client bundle / network tab.
- **Cause:** A secret env var was prefixed `NEXT_PUBLIC_`, which inlines it into client JS.
- **Fix:** Never prefix secrets with `NEXT_PUBLIC_`. Read them only in server code (Route Handlers, Server Components, `lib/*`).

### `searchParams` not driving filter state
- **Symptom:** Directory filters reset on refresh; shared URL doesn't reproduce results; back button broken.
- **Cause:** Filter state kept in component `useState` only.
- **Fix:** Read/write filters via the URL query string (`searchParams` server-side, `useSearchParams` + `router.replace` client-side). Debounce the free-text `q` input.

### shadcn theme tokens
- **Symptom:** Dark mode or theming looks broken; colors hardcoded.
- **Cause:** Used `bg-white`/`text-black` instead of theme tokens.
- **Fix:** Use `bg-background`, `text-foreground`, etc.

---

## Prisma / Postgres pitfalls

### N+1 queries on the directory
- **Symptom:** Directory load slow, dozens of queries; degrades as profiles grow.
- **Cause:** Looping over profiles fetching coverage/lanes one at a time.
- **Fix:** Use Prisma `include`/`select` to eager-load, or batch. Index `status`, `country`, `mode`, `service`, lane columns.

### Missing pagination
- **Symptom:** `/api/forwarders` returns thousands of rows; client memory spikes.
- **Cause:** Endpoint built against tiny seed data, never paginated.
- **Fix:** `take`/`skip` (or cursor) with default `pageSize=20`, cap 200. Return `{ page, pageSize, total, results }`.

### Editing an applied migration
- **Symptom:** `migrate` drift error; teammates' DBs diverge.
- **Cause:** Changed a migration that was already applied.
- **Fix:** Never edit applied migrations — create a new one (`prisma migrate dev --name ...`).

### Race condition on slug / parallel writes
- **Symptom:** Duplicate slug, or last-write-wins corruption on profile submit.
- **Cause:** Read-modify-write without a transaction or unique constraint.
- **Fix:** Unique constraint on `slug`; generate server-side with `-2`/`-3` suffix on collision inside a transaction.

### Storing local time instead of UTC
- **Symptom:** Timestamps off by N hours for some users.
- **Cause:** Stored local `new Date()` or rendered UTC as local without conversion.
- **Fix:** Store UTC; convert at display with the user's timezone / `Intl.DateTimeFormat`.

---

## Always-applicable pitfalls

### Secrets in code or logs
- **Symptom:** API key / password in `git log`, `console.log`, or error reports.
- **Cause:** Hardcoded secret, `.env` not ignored, or logger doesn't redact.
- **Fix:** Use env vars; keep `.env*` in `.gitignore` + `.claudeignore`; redact tokens in `lib/logger`.

### Trusting client-supplied IDs
- **Symptom:** User A reads/edits User B's records.
- **Cause:** Endpoint takes `ownerId`/`userId` from the body and trusts it.
- **Fix:** Always derive owner from the authenticated session; check ownership on every read/write.

### Missing rate limit on public endpoints
- **Symptom:** Inquiry/registration spam, abuse.
- **Cause:** No throttle on public POSTs.
- **Fix:** Server-side rate limit (`429 RATE_LIMITED`) on `/api/inquiries` and registration; honeypot/captcha on the inquiry form.

### Idempotency missing on retry-prone mutations
- **Symptom:** Duplicate inquiries on double-click / network retry.
- **Cause:** No idempotency key.
- **Fix:** Accept an idempotency key on inquiry submit; disable the submit button on first click.

---

## Project-specific pitfalls (FreightConnect invariants)

### Directory leaking non-approved profiles  ← #1 trust bug
- **Symptom:** A `pending`/`rejected`/`suspended` forwarder appears in search or at `/forwarders/:slug`.
- **Cause:** A public query forgot the `status = approved` filter.
- **Fix:** Centralize public reads in a `lib/forwarders` helper that always filters `status = approved`. Cover with an integration test (PRD F1 AC3, F2 AC3).

### KYC document exposed on a public payload
- **Symptom:** A KYC doc URL or internal review note appears in a public API response.
- **Cause:** Returned a raw Prisma entity instead of a whitelisted projection.
- **Fix:** Public `/api/forwarders/:slug` returns an explicit `select` projection. KYC docs served ONLY via short-lived signed URLs from admin-only code. Test that the public payload omits KYC fields.

### Inquiry lost when the email provider fails
- **Symptom:** Shipper sees an error / no record; lead is gone.
- **Cause:** Email sent before persisting, and the send threw.
- **Fix:** Persist the `Inquiry` first (`status: sent|queued`); enqueue email with retry. User sees success even if the provider is down (PRD F4 error cases).

### Admin route protected only in the UI
- **Symptom:** A forwarder/shipper hits `/api/admin/...` directly and it works.
- **Cause:** Role check done in the component, not the handler.
- **Fix:** Enforce admin role server-side in every `/admin/*` page and `/api/admin/*` handler (PRD F5 AC4). Hiding UI is not access control.

### Upload validated only client-side
- **Symptom:** Oversized or non-image/PDF file lands in storage.
- **Cause:** Size/type checked only in the browser.
- **Fix:** Validate content-type + size on the server; accept pdf/jpg/png only; 10 MB max → `413`/`400 BAD_FILE` (PRD F3 AC4).

### User enumeration on auth errors
- **Symptom:** Different message/timing reveals whether an email is registered.
- **Cause:** Distinct "no such user" vs "wrong password" responses.
- **Fix:** Identical generic error + constant-time comparison for unknown-email vs wrong-password (PRD F6 AC5).

---

_(Add new entries as you discover them. Include a `- **Date logged:** YYYY-MM-DD` line.)_
