# Authentication — Global Trade Collective

> **Auth provider: Clerk** (migrated from NextAuth v5 on 2026-06-04).
> Clerk handles identity (Google + email sign-in, email verification, sessions).
> The Prisma `User` row remains the **source of truth for role + ownership**.

## 1. Model

Clerk owns *who you are*; our database owns *what you can do*.

```
Clerk user (userId / clerkId)  ──linked by──▶  Prisma User { id, clerkId, email, role, emailVerified }
                                                         │
                                          role: shipper | forwarder | admin
                                          owns: ForwarderProfile, Inquiry, …
```

On every authenticated request, `syncCurrentUser()` (`lib/auth/sync.ts`) maps the
Clerk session to a DB `User` and returns `{ id, email, role, isVerified }`:

1. Find `User` by `clerkId`.
2. Else find by `email` and link it (sets `clerkId`) — this is how pre-seeded
   forwarder owners and admin rows adopt a Clerk identity on first sign-in.
3. Else create a new `User` with `role: "shipper"`.
4. Keep `emailVerified` in sync with Clerk's verified email.

Because the return shape is unchanged, every API route and gated page that used
the old NextAuth guards keeps working untouched.

## 2. Guards (`lib/auth/guards.ts`)

Same exported API as before — only the internals changed:

- `getCurrentUser()` → DB user (synced from Clerk) or `null`.
- `requireUser(next?)` → redirects to `/sign-in?redirect_url=…` if signed out.
- `requireRole(role, next?)` → redirects to `/` on role mismatch.

## 3. Roles

- **shipper** — default for any new sign-in. Can browse + send inquiries (inquiry
  itself is anonymous-friendly; no account required to contact a forwarder).
- **forwarder** — auto-promoted from shipper the moment a user opens
  `/register/forwarder` ("List your company"). One-way, via `promoteToForwarder()`.
- **admin** — never self-assigned. Marked by email in the DB (see §5), then the
  person signs in via Clerk with that email and `syncCurrentUser()` links them.

## 4. Route protection (`middleware.ts`)

Public by default. `auth.protect()` runs only on:

```
/dashboard(.*)            /admin(.*)            /register/forwarder(.*)
/api/forwarders/draft(.*) /api/admin(.*)
```

Everything else (landing, directory, public profiles, inquiry) is open — that's
the shipper discovery surface and must stay crawlable/SEO-friendly.

## 5. Operations

### Make someone an admin

```bash
ADMIN_EMAIL=person@example.com pnpm create:admin
```

Runs against whatever `DATABASE_URL` points to. For **production**, use the
Railway Postgres public proxy URL (the app's internal `DATABASE_URL` is not
reachable from a laptop):

```bash
# pull the public URL from the Postgres service, don't print it
PGURL=$(railway variables --service Postgres --json | python3 -c "import sys,json;print(json.load(sys.stdin)['DATABASE_PUBLIC_URL'])")
ADMIN_EMAIL=person@example.com DATABASE_URL="$PGURL" pnpm create:admin
```

The person then signs in at `/sign-in` with that email; admin access activates
on first authenticated request.

### Required environment variables

| Var | Where | Notes |
|-----|-------|-------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | build + runtime | **Inlined at `next build`** — must be a Docker build ARG (see `Dockerfile`). |
| `CLERK_SECRET_KEY` | runtime | Server only. Never expose client-side. |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | runtime | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | runtime | `/sign-up` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | runtime | `/` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | runtime | `/` |
| `AUTH_SECRET` | runtime | **Kept** — still used by `lib/admin/signed-url.ts` to HMAC KYC signed URLs. Not a Clerk var. |

Production currently runs Clerk **development-instance** keys (`pk_test_…` /
`sk_test_…`), which work on any host (fine for the demo, shows a small dev badge).
Switch to production keys + a custom domain before public launch.

## 6. Version gotchas

This project pins **`@clerk/nextjs` 7.4.3**, whose React API differs from the
common 6.x docs — see `docs/known-pitfalls.md` (Clerk section). In short:
`<Show when="signed-in">` replaces `SignedIn`/`SignedOut`, and `UserButton`
has no `afterSignOutUrl` prop.

## 7. What was removed

NextAuth v5 and its hand-rolled pieces are gone: `auth.ts`,
`types/next-auth.d.ts`, `lib/auth/{credentials,password,tokens,register}.ts`,
`lib/validation/auth.ts`, `app/api/auth/*`, the `(auth)` login/register/
verify-email pages, and the `DEMO_AUTOVERIFY` hack. Packages `next-auth` and
`bcryptjs` were uninstalled. Password hashing is no longer ours to manage —
Clerk owns credentials.
