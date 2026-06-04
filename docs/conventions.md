# Code Conventions — FreightConnect

> How code should look in this repo. TypeScript + Next.js 15 (App Router) + Prisma + Tailwind/shadcn.

## 1. File & folder naming

- Route segments are lowercase: `app/forwarders/[slug]/page.tsx`, `app/api/forwarders/route.ts`.
- React components: `PascalCase.tsx` (e.g. `ForwarderCard.tsx`). One component per file.
- Services / utils / hooks: `camelCase.ts` (e.g. `createInquiry.ts`, `useForwarderFilters.ts`).
- Zod schemas: co-located in the module, named `<thing>Schema` (e.g. `inquirySchema`).
- Tests: `<name>.test.ts` co-located OR under `tests/`; Playwright specs under `e2e/*.spec.ts`.

Example — the inquiry feature (F4) adds roughly:

```
app/api/inquiries/route.ts          # POST handler (Route Handler)
lib/inquiries/createInquiry.ts      # service: persist-then-notify
lib/inquiries/inquirySchema.ts      # Zod validation
components/InquiryForm.tsx           # "use client" form
tests/inquiries/createInquiry.test.ts
e2e/inquiry.spec.ts
```

## 2. Imports

- Use the `@/` path alias (configured in `tsconfig.json`) over deep relative paths (`../../../`).
- Group imports: external → `@/` internal → types → styles.
- Import only what you use; no namespace imports of large libs.

## 3. Error handling

- API Route Handlers return the project error envelope with the documented status:
  ```ts
  return NextResponse.json({ error: "INVALID_FILTER", field: "mode" }, { status: 400 });
  ```
- Validate input with **Zod at the boundary** (query params, bodies, uploads) before touching a service.
- Services throw typed domain errors; handlers map them to envelopes. Never leak a stack trace to the client.
- Don't swallow errors with empty `catch`. Don't use `console.log` for error reporting in app code — use `lib/logger`.

## 4. Data access

- All DB access goes through a repository/service in `lib/*` — never call Prisma directly inside a React component or page.
- Public reads use a **whitelisted projection** (`select`) — never `return profile` raw on a public endpoint (KYC + internal fields must not leak).
- Scope every query by the authenticated owner for dashboard/admin reads. Identity comes from the session, never the request body.
- Never edit an applied migration; add a new one.

## 5. API / service response shape

- Success: the resource or `{ page, pageSize, total, results }` for lists.
- Error: `{ error: "<CODE>", field?: string, message?: string }`.
- Status codes follow the PRD route tables (200/201/400/401/403/404/409/413/429/503).

## 6. Component / module structure

- Default to **Server Components**. Add `"use client"` only to files that use hooks, event handlers, or browser APIs.
- Keep business logic in `lib/*` services and hooks — not in components.
- Server Components must not pass functions or class instances as props to Client Components.
- Directory filter state lives in the **URL query string** (use `searchParams` / `useSearchParams`), not local-only state.

## 7. Styling / UI

- Tailwind utility classes; use shadcn/ui primitives before hand-rolling.
- Use theme tokens (`bg-background`, `text-foreground`) — not raw `bg-white`/`text-black`.
- `next/image` requires `width`+`height` (or `fill` + a sized parent).
- Target WCAG 2.1 AA on public pages (directory, profile, inquiry): labels, focus states, color contrast.
- Add `data-testid` to elements the browser-verifier / Playwright assert on (e.g. `[data-testid="verified-badge"]`).

## 8. Testing

- Every new feature ships with at least one test.
- Unit/integration in Vitest (`tests/` or co-located); E2E in Playwright (`e2e/`), critical flows only.
- Mock external services (email, storage, captcha) at the boundary, not deep in business logic.
- Assert error paths, not just happy paths (auth gates, 403 cross-tenant, 400 validation, 429 rate limit).

See @docs/test-strategy.md for what gets unit vs integration vs E2E coverage.

## 9. Anti-patterns — do not do these

- ❌ Returning a raw Prisma entity on a public endpoint (KYC / internal fields leak)
- ❌ Reading owner/tenant id from the request body instead of the session
- ❌ Business logic in UI components (keep it in `lib/*` services / hooks)
- ❌ Catch-all `any` to silence TS errors — fix the type
- ❌ Listing forwarders without a `status = approved` filter
- ❌ Sending email before persisting the inquiry
- ❌ Filter state kept only in component state (breaks shareable URLs + back button)
- ❌ `// TODO: fix later` without a linked issue

## 10. Commit messages

Format: `<type>(<scope>): <summary>`

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`

Example: `feat(forwarders): add country+mode directory filters`
