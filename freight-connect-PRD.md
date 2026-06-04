# FreightConnect — Product Requirements

<!--
This PRD is written for both humans AND AI coding agents (Claude Code).
Every section is explicit, testable, and self-contained.

Conventions:
- TODO: <text>   → requires product decision from a human
- ASSUMPTION: <text> → best guess; confirm before building
- P0 = must ship in v1. P1 = nice to have. P2 = backlog.

Verification tags (used on every AC):
- `unit`           → covered by a unit test
- `integration`    → covered by an integration test (service ↔ DB, API handler)
- `browser-verify` → ran via /verify slash command (browser-verifier navigates the route, reads console, screenshots)
- `manual`         → human sign-off (use sparingly)
-->

**Status:** Draft v1 · **Last updated:** 2026-06-02

> **Note on naming:** "FreightConnect" is a working placeholder. Replace with your final brand. The product concept is derived from a competitive study of df-alliance.com, searates.com, wcaworld.com, jctrans.com, and twignetwork.com (see Appendix A).

---

## 1. Summary

**What it is (one sentence):** A two-sided web marketplace where cargo shippers search for and contact verified freight-forwarding agents by country/trade-lane/service, and where freight forwarders register, build a multi-country company profile, and receive inbound shipping inquiries.

**Problem:** Shippers (importers/exporters, SMBs, other forwarders needing a destination agent) struggle to find a trustworthy freight forwarder for a specific country or trade lane. Discovery happens through fragmented referrals, generic search, or closed paid networks. Forwarders, in turn, lack a low-friction channel to be discovered by buyers outside their existing relationships and to advertise the specific lanes/services they cover.

**Primary users:** (1) **Shipper / cargo owner** searching for a forwarding service; (2) **Freight forwarder** registering a company profile to attract inquiries. A platform **admin** vets forwarders and curates the directory.

**Product type:** Full-stack web app (responsive) · **Browser-facing:** Yes · **Stage:** Greenfield

The market study shows two recurring patterns across all five reference sites: a **searchable directory of forwarders** filtered by country, port, transport mode, and service, and a **forwarder-facing profile/membership module** gated by a verification (KYC) step. <cite index="3-1">Every WCAworld member is carefully screened before acceptance, ensuring that only the best companies offering the highest standards of service are admitted.</cite> JCtrans similarly frames its directory around member discovery: <cite index="12-1">access the member directory, company profiles, and online inquiries to unlock business opportunities, with membership spanning 181 countries and 12,000+ paid members.</cite> FreightConnect v1 adopts the directory + verified-profile + inquiry core and defers the heavier financial/insurance products those incumbents layer on top.

---

## 2. Users & context

### Primary persona A — Shipper (the "searcher" module)

| Attribute | Value |
|-----------|-------|
| Role | Importer/exporter, e-commerce seller, SMB logistics manager, or a forwarder seeking a destination-country agent |
| Context | Has cargo to move on a specific lane (e.g. Shanghai → Hamburg, FCL) and needs a capable, trustworthy forwarder at origin/destination |
| Current workflow | Google search, referrals, cold emails, or paid membership networks they can't access |
| What they care about | Finding a *verified* forwarder for the *exact* country/port/mode/service; speed of response; trust signals |
| What they explicitly don't care about (v1) | Booking/paying through the platform; live rate quotes; container tracking |

### Primary persona B — Freight forwarder (the "register" module)

| Attribute | Value |
|-----------|-------|
| Role | Owner/sales lead at an independent or mid-market freight-forwarding company |
| Context | Wants inbound leads and global visibility; operates in one or more countries with specific lane/mode/service strengths |
| Current workflow | Pays for network memberships, attends conferences, works existing agent relationships |
| What they care about | A rich profile that showcases coverage and credentials; qualified inbound inquiries; being marked "verified" |
| What they explicitly don't care about (v1) | Running their TMS on the platform; settlement/payments between members |

### Secondary persona C — Platform admin

Reviews forwarder applications and KYC documents, approves/rejects/suspends profiles, manages the country/port/service taxonomy, and moderates abuse. Internal tool surface.

### Key use cases

1. When a shipper has cargo for a specific lane, they want to search forwarders filtered by country + transport mode + service, so they can shortlist and contact 2–3 verified agents.
2. When a forwarder joins, they want to register, complete KYC, and publish a multi-country profile, so they can appear in relevant search results and receive inquiries.
3. When a shipper finds a suitable forwarder, they want to send a structured inquiry (lane, cargo, mode), so the forwarder can respond with a quote off-platform.
4. When an admin receives a forwarder application, they want to review submitted documents and approve/reject, so only vetted companies appear as "verified."

---

## 3. Scope

### In scope for v1

| # | Feature | Priority | Brief description | Verification |
|---|---------|----------|-------------------|--------------|
| F1 | Forwarder directory search & filters | P0 | Public, paginated, filterable directory of approved forwarder profiles | browser-verify + integration |
| F2 | Forwarder public profile page | P0 | Rich profile: company, countries served, lanes, modes, services, credentials, verified badge | browser-verify + integration |
| F3 | Forwarder registration & onboarding | P0 | Sign-up, company details, multi-country/lane profile builder, KYC document upload, submit for review | browser-verify + integration |
| F4 | Inquiry / contact flow | P0 | Shipper sends a structured inquiry to a forwarder; forwarder receives + responds | browser-verify + integration |
| F5 | Admin verification & moderation console | P0 | Admin reviews KYC, approves/rejects/suspends, manages taxonomy | browser-verify + integration |
| F6 | Auth & accounts (shipper, forwarder, admin roles) | P0 | Email/password + email verification; role-based access | integration + browser-verify |
| F7 | Forwarder dashboard (profile edit, inquiries inbox) | P1 | Logged-in forwarder manages profile + inquiries | browser-verify |
| F8 | Search by trade lane & port (origin→destination) | P1 | Lane-aware search beyond single-country filter | browser-verify + integration |
| F9 | Reviews / ratings of forwarders | P2 | Shipper leaves a rating after an inquiry | integration |

### Explicitly NOT in scope for v1 (non-goals)

- **No on-platform booking, payments, or settlement** between parties. Inquiries hand off to email/phone. (Incumbents like JCtrans offer member settlement; we defer it.)
- **No live freight rate engine or instant quotation.** SeaRates/df-alliance offer rate tools; v1 only routes inquiries, it does not price them.
- **No container/cargo tracking.** Out of scope despite being common on reference sites.
- **No financial-protection / cargo-insurance product.** WCAworld's Gold Medallion and JCtrans' risk protection are out of scope.
- **No conferences/events module, academy, or 1-on-1 meeting scheduler.**
- **No native mobile app.** Responsive web only.
- **No paid membership tiers / billing in v1.** Registration is free; monetization deferred (see Future).
- **No multi-language UI in v1.** English only (see Open Questions).

### Future considerations (out of v1 scope — do NOT build)

- Paid membership tiers, featured listings, billing (Stripe).
- Rate quotation and lane pricing tools.
- Container tracking integration.
- Conferences/events and in-app messaging threads.
- Multi-language localization.
- Public REST API for partners.

---

## 4. Feature specifications

### F1 · Forwarder directory search & filters — P0

**User story:** As a shipper, I want to search and filter verified forwarders by country, transport mode, and service, so I can find agents that match my exact shipping need.

**Description:** A public, server-paginated directory listing only approved + active forwarder profiles. Filters mirror the taxonomy used across reference sites — country/region, port, transport mode (Sea FCL, Sea LCL, Air, Rail, Road, Intermodal), and service advantages. Results show a profile card with company name, primary country, modes, verified badge, and a CTA to view profile / send inquiry.

**Routes & network:**

| Route | Method | Purpose | Expected status |
|-------|--------|---------|-----------------|
| `/forwarders` | GET | Renders the directory page (SSR with default list) | 200 |
| `/api/forwarders?country=&mode=&service=&port=&q=&page=` | GET | Returns filtered, paginated forwarder summaries | 200 (ok), 400 (bad filter param) |

**Happy path:**

1. Shipper lands on `/forwarders`; sees first page (20 results) of approved forwarders, newest/most-complete first.
2. Selects Country = "Germany", Mode = "Sea FCL".
3. List re-queries `GET /api/forwarders?country=DE&mode=sea_fcl&page=1` and updates without full reload.
4. Shipper clicks a card → navigates to `/forwarders/:slug` (F2).

**Data in (query params):**

```json
{ "country": "DE", "mode": "sea_fcl", "service": "customs_clearance", "port": "DEHAM", "q": "reefer", "page": 1, "pageSize": 20 }
```

**Data out:**

```json
{
  "page": 1,
  "pageSize": 20,
  "total": 137,
  "results": [
    {
      "id": "f_01H...",
      "slug": "acme-logistics-de",
      "companyName": "ACME Logistics GmbH",
      "primaryCountry": "DE",
      "countriesServed": ["DE", "NL", "PL"],
      "modes": ["sea_fcl", "sea_lcl", "air"],
      "services": ["customs_clearance", "warehousing"],
      "verified": true,
      "logoUrl": "https://cdn/.../acme.png"
    }
  ]
}
```

**Acceptance criteria:**

| # | Given | When | Then | Verify |
|---|-------|------|------|--------|
| AC1 | Shipper on `/forwarders`, ≥20 approved forwarders exist | page loads | first 20 approved+active forwarders render as cards; `GET /api/forwarders?page=1` returns 200; pagination control shows total pages; zero console errors | browser-verify |
| AC2 | On `/forwarders` | selects Country=DE and Mode=sea_fcl | list re-queries with both params; every visible card has `primaryCountry` or `countriesServed` containing DE AND `modes` containing sea_fcl; URL reflects filters as query string | browser-verify |
| AC3 | A forwarder profile is `pending` or `rejected` | any directory query runs | that profile never appears in results | integration |
| AC4 | Filters yield zero matches | query runs | empty-state message renders ("No forwarders match these filters"); no spinner hangs; 200 with `results: []` | browser-verify |
| AC5 | Invalid filter (e.g. `mode=teleport`) | `GET /api/forwarders?mode=teleport` | returns 400 `{ error: "INVALID_FILTER", field: "mode" }`; UI ignores invalid value gracefully | integration |

**Error cases:**

| Case | Expected behavior | Verify |
|------|------------------|--------|
| Invalid filter value | 400 `{ error: "INVALID_FILTER", field }`; UI clears that filter, shows toast | integration + browser-verify |
| DB down | 503; "Directory temporarily unavailable" message; retry-safe | integration |
| Network timeout (browser) | Inline "Couldn't load results, retry" with retry button; no infinite spinner | browser-verify |
| Page param beyond range | Returns last valid page or empty results; never 500 | integration |

**Known pitfalls to anticipate:**

- Filter state must live in the URL (query string) so results are shareable and back-button works; don't keep it only in component state.
- Debounce the free-text `q` input to avoid a request per keystroke.
- Index DB columns used in filters (country, mode, service, status) or list queries will degrade as profiles grow.

**Dependencies:** F2 (profile data), F5 (only approved profiles are listed), taxonomy seed data.

**Out of scope for this feature:** Rate display, sorting by price, map-based search.

---

### F2 · Forwarder public profile page — P2→P0

**User story:** As a shipper, I want to view a forwarder's full profile, so I can assess fit and trust before contacting them.

**Description:** Public page per approved forwarder at `/forwarders/:slug`. Shows company identity, the **verified** badge if approved, countries served (with per-country office details), supported transport modes, services/advantages, trade lanes, certifications/credentials, year established, and a prominent "Send inquiry" CTA (F4). Mirrors the "digital store / company profile" pattern across the reference sites. <cite index="12-1">Rich profiles use advantage labels, certificates, and videos to demonstrate member capability.</cite>

**Routes & network:**

| Route | Method | Purpose | Expected status |
|-------|--------|---------|-----------------|
| `/forwarders/:slug` | GET | Renders the public profile (SSR for SEO) | 200, 404 (unknown/unapproved slug) |
| `/api/forwarders/:slug` | GET | Profile detail payload | 200, 404 |

**Happy path:**

1. Shipper clicks a directory card → `/forwarders/acme-logistics-de`.
2. Page renders company header, verified badge, countries-served list, modes, services, credentials.
3. Shipper clicks "Send inquiry" → opens inquiry form (F4).

**Data out:**

```json
{
  "id": "f_01H...",
  "slug": "acme-logistics-de",
  "companyName": "ACME Logistics GmbH",
  "verified": true,
  "yearEstablished": 2009,
  "about": "Independent forwarder specializing in EU customs...",
  "logoUrl": "https://cdn/.../acme.png",
  "websiteUrl": "https://acme-logistics.example",
  "countriesServed": [
    { "country": "DE", "city": "Hamburg", "isHeadquarters": true, "ports": ["DEHAM"] },
    { "country": "NL", "city": "Rotterdam", "isHeadquarters": false, "ports": ["NLRTM"] }
  ],
  "modes": ["sea_fcl", "sea_lcl", "air"],
  "services": ["customs_clearance", "warehousing", "project_cargo"],
  "tradeLanes": [{ "originCountry": "CN", "destinationCountry": "DE" }],
  "credentials": [{ "type": "IATA", "id": "1234567", "verifiedByAdmin": true }]
}
```

**Acceptance criteria:**

| # | Given | When | Then | Verify |
|---|-------|------|------|--------|
| AC1 | An approved forwarder with slug `acme-logistics-de` | shipper visits `/forwarders/acme-logistics-de` | page renders companyName, modes, countriesServed; `GET /api/forwarders/acme-logistics-de` returns 200; HTTP status 200; zero console errors | browser-verify |
| AC2 | Forwarder is `verified=true` | profile loads | a visible "Verified" badge element `[data-testid="verified-badge"]` is present | browser-verify |
| AC3 | Slug does not exist OR profile is not approved | shipper visits that URL | server returns 404 and a friendly not-found page; no profile data leaks | integration + browser-verify |
| AC4 | Approved profile with no optional fields (e.g. no credentials) | profile loads | optional sections are hidden gracefully, no empty headers, no console errors | browser-verify |

**Error cases:**

| Case | Expected behavior | Verify |
|------|------------------|--------|
| Unknown/unapproved slug | 404 page; no stack trace | integration + browser-verify |
| Broken logo URL | Fallback placeholder logo renders; no broken-image icon | browser-verify |
| Profile suspended after indexing | 404/410; removed from directory | integration |

**Known pitfalls to anticipate:**

- Render server-side for SEO (these pages are the organic-discovery surface).
- Never expose KYC documents or internal review notes on the public payload — public `/api/forwarders/:slug` must be a separate, whitelisted projection of the entity.

**Dependencies:** F3 (profile data source), F5 (approval gates visibility), F4 (inquiry CTA).

**Out of scope for this feature:** Editing (that's the dashboard, F7), ratings (F9).

---

### F3 · Forwarder registration & onboarding — P0

**User story:** As a freight forwarder, I want to register and build a multi-country profile with KYC documents, so I can be verified and appear in the directory.

**Description:** Multi-step onboarding: (1) account creation, (2) company details, (3) coverage builder (add one or more countries, each with city/ports, plus modes, services, trade lanes), (4) credentials, (5) KYC document upload, (6) submit for review. On submit, profile status = `pending`; it is NOT publicly visible until an admin approves (F5). The verification gate is the core trust mechanism the reference networks rely on. <cite index="20-1">A strict member selection process ensures only the best companies are accepted into the group.</cite>

**Routes & network:**

| Route | Method | Purpose | Expected status |
|-------|--------|---------|-----------------|
| `/register/forwarder` | GET | Renders onboarding wizard | 200 |
| `/api/forwarders` | POST | Creates draft forwarder profile | 201, 400, 401 |
| `/api/forwarders/:id` | PATCH | Updates a step's data (autosave per step) | 200, 400, 401, 403 |
| `/api/forwarders/:id/documents` | POST | Uploads a KYC document (multipart) | 201, 400, 401, 413 (too large) |
| `/api/forwarders/:id/submit` | POST | Transitions draft → pending | 200, 400 (incomplete), 401, 403 |

**Happy path:**

1. Forwarder signs up (F6) and lands on `/register/forwarder`.
2. Enters company details (name, country of HQ, year established, website) → autosaves via PATCH.
3. Adds ≥1 country served with city + ports; selects modes + services; optionally adds trade lanes.
4. Uploads KYC document(s) (e.g. business registration); each returns a stored reference.
5. Clicks "Submit for review" → `POST /submit` → status becomes `pending`; sees confirmation screen.

**Data in (POST /api/forwarders):**

```json
{
  "companyName": "ACME Logistics GmbH",
  "primaryCountry": "DE",
  "yearEstablished": 2009,
  "websiteUrl": "https://acme-logistics.example",
  "countriesServed": [
    { "country": "DE", "city": "Hamburg", "isHeadquarters": true, "ports": ["DEHAM"] }
  ],
  "modes": ["sea_fcl", "air"],
  "services": ["customs_clearance"]
}
```

**Data out:**

```json
{ "id": "f_01H...", "status": "draft", "slug": "acme-logistics-de", "createdAt": "2026-06-02T10:00:00Z" }
```

**Acceptance criteria:**

| # | Given | When | Then | Verify |
|---|-------|------|------|--------|
| AC1 | Authenticated forwarder user on `/register/forwarder` | submits step 1 with valid company details | `POST /api/forwarders` returns 201 with `status:"draft"`; wizard advances to step 2; zero console errors | browser-verify |
| AC2 | Draft with no country served | clicks "Submit for review" | `POST /submit` returns 400 `{ error: "INCOMPLETE", missing: ["countriesServed"] }`; inline error shown; status stays draft | integration + browser-verify |
| AC3 | Draft is complete (≥1 country, ≥1 mode, ≥1 KYC doc) | clicks "Submit for review" | `POST /submit` returns 200 `{ status:"pending" }`; confirmation screen renders; profile NOT yet in directory (F1 AC3) | browser-verify |
| AC4 | Uploading a 30 MB file when limit is 10 MB | uploads document | `POST /documents` returns 413; inline "File too large (max 10 MB)"; no partial record | integration + browser-verify |
| AC5 | Unauthenticated user | visits `/register/forwarder` | redirected to `/login?next=/register/forwarder` | browser-verify |
| AC6 | Forwarder A authenticated | PATCHes forwarder B's profile id | `403 { error: "FORBIDDEN" }`; no data change | integration |

**Error cases:**

| Case | Expected behavior | Verify |
|------|------------------|--------|
| Missing required field | 400 `{ error:"MISSING_FIELD", field }`; inline form error; no submit | integration + browser-verify |
| Unauthorized (not logged in) | 401; redirect to `/login` | browser-verify |
| Editing another user's profile | 403; no mutation | integration |
| File too large / wrong type | 413 or 400 `{ error:"BAD_FILE" }`; only pdf/jpg/png accepted | integration + browser-verify |
| Double-click submit | Single transition; second call returns 200 idempotently or 409 if already pending | integration |

**Known pitfalls to anticipate:**

- Derive the owning user from the session, never trust a client-supplied `ownerId`.
- Generate `slug` server-side and guarantee uniqueness (append `-2`, `-3` on collision).
- Validate uploaded files by content type + size on the server, not just client-side.
- Disable the submit button on first click to prevent double submission.
- Store KYC docs in a private bucket; never serve them from a public URL.

**Dependencies:** F6 (auth), F5 (review consumes the submitted profile), storage bucket for documents.

**Out of scope for this feature:** Public display (F2), post-approval editing (F7), payment.

---

### F4 · Inquiry / contact flow — P0

**User story:** As a shipper, I want to send a structured inquiry to a forwarder, so they can respond with a quote off-platform.

**Description:** From a profile (F2), a shipper submits an inquiry capturing the lane and cargo basics (origin, destination, mode, cargo type, message, contact details). The inquiry is stored and the forwarder is notified by email; the shipper gets a confirmation. v1 does **not** host the ensuing conversation — the forwarder replies via the shipper's provided email. Mirrors the "inquiry board / online inquiry" pattern from JCtrans without on-platform messaging. <cite index="12-1">Members post and receive inquiries with quick quoting to reach business opportunities.</cite>

**Routes & network:**

| Route | Method | Purpose | Expected status |
|-------|--------|---------|-----------------|
| `/forwarders/:slug` (inquiry modal/section) | GET | Hosts the inquiry form | 200 |
| `/api/inquiries` | POST | Creates an inquiry + triggers notification email | 201, 400, 429 (rate limit) |

**Happy path:**

1. Shipper clicks "Send inquiry" on a profile.
2. Fills lane (origin/destination country + port), mode, cargo type, message, name, email.
3. Submits → `POST /api/inquiries` → 201; success toast + "We've forwarded your request" screen.
4. Forwarder receives notification email with inquiry details and the shipper's reply-to address.

**Data in:**

```json
{
  "forwarderId": "f_01H...",
  "shipper": { "name": "Jane Doe", "email": "jane@buyer.example", "company": "Buyer Co" },
  "lane": { "originCountry": "CN", "originPort": "CNSHA", "destinationCountry": "DE", "destinationPort": "DEHAM" },
  "mode": "sea_fcl",
  "cargoType": "general",
  "message": "Need a quote for 2x40HC, monthly."
}
```

**Data out:**

```json
{ "id": "inq_01H...", "status": "sent", "createdAt": "2026-06-02T10:05:00Z" }
```

**Acceptance criteria:**

| # | Given | When | Then | Verify |
|---|-------|------|------|--------|
| AC1 | Shipper on an approved profile | submits inquiry with valid fields | `POST /api/inquiries` returns 201; success screen renders; inquiry persisted with `status:"sent"`; zero console errors | browser-verify |
| AC2 | Inquiry created | server processes it | a notification email is dispatched to the forwarder's contact email (assert provider called with correct recipient) | integration |
| AC3 | Missing email or message | submits | 400 `{ error:"MISSING_FIELD", field }`; inline error; no record created | integration + browser-verify |
| AC4 | Same IP/email sends 6 inquiries in 1 minute | 6th submit | `429 { error:"RATE_LIMITED" }`; UI shows "Too many requests, try again shortly" | integration |
| AC5 | Inquiry targets a non-approved/suspended forwarder | submit | 404/400; no email sent | integration |

**Error cases:**

| Case | Expected behavior | Verify |
|------|------------------|--------|
| Invalid email format | 400 inline validation; no record | integration + browser-verify |
| Email provider down | Inquiry still persisted with `status:"queued"`; retry job re-sends; user still sees success | integration |
| Spam/rate abuse | 429 after threshold; optional honeypot field rejects bots silently | integration |
| Network timeout (browser) | Inline retry; no double-send (idempotency key) | browser-verify |

**Known pitfalls to anticipate:**

- Add a honeypot or captcha to limit spam, but keep the form low-friction.
- Persist the inquiry before sending email so a provider failure never loses the lead.
- Use an idempotency key to avoid duplicate inquiries on retry/double-click.

**Dependencies:** F2 (entry point), email provider integration, F7 (forwarder sees it in dashboard inbox).

**Out of scope for this feature:** On-platform threaded chat, attachments, quote pricing.

---

### F5 · Admin verification & moderation console — P0

**User story:** As a platform admin, I want to review forwarder applications and their KYC documents, so I can approve, reject, or suspend profiles and keep the directory trustworthy.

**Description:** Internal, admin-only console listing `pending` profiles with their submitted data and KYC documents. Admin can approve (→ `approved`, `verified=true`, becomes public), reject (with reason, notify applicant), or suspend an existing approved profile (→ removed from directory). Admin also manages the country/port/service/mode taxonomy. The verification gate is what makes the "Verified" badge meaningful. <cite index="3-1">Screening before acceptance is what ensures only companies meeting the standard are admitted.</cite>

**Routes & network:**

| Route | Method | Purpose | Expected status |
|-------|--------|---------|-----------------|
| `/admin/review` | GET | Queue of pending profiles (admin only) | 200, 401, 403 |
| `/admin/review/:id` | GET | Single application detail + documents | 200, 403, 404 |
| `/api/admin/forwarders/:id/approve` | POST | Approve + set verified | 200, 403, 409 |
| `/api/admin/forwarders/:id/reject` | POST | Reject with reason | 200, 400 (no reason), 403 |
| `/api/admin/forwarders/:id/suspend` | POST | Suspend an approved profile | 200, 403 |

**Happy path:**

1. Admin logs in, opens `/admin/review`; sees pending queue.
2. Opens an application; views company data + downloads KYC document via a signed, time-limited URL.
3. Clicks "Approve" → profile becomes `approved` + `verified=true`; now appears in F1/F2.
4. Applicant receives an approval email.

**Data out (approve):**

```json
{ "id": "f_01H...", "status": "approved", "verified": true, "reviewedBy": "admin_01H...", "reviewedAt": "2026-06-02T11:00:00Z" }
```

**Acceptance criteria:**

| # | Given | When | Then | Verify |
|---|-------|------|------|--------|
| AC1 | Admin on `/admin/review`, ≥1 pending profile | page loads | pending profiles listed; `GET /admin/review` 200; non-pending profiles excluded; zero console errors | browser-verify |
| AC2 | Admin viewing a pending application | clicks "Approve" | `POST /approve` 200; status→approved, verified→true; profile now returned by `/api/forwarders` (F1 AC3 inverse) | integration + browser-verify |
| AC3 | Admin clicks "Reject" with empty reason | submit | 400 `{ error:"REASON_REQUIRED" }`; no status change | integration |
| AC4 | Non-admin user (forwarder/shipper) | requests any `/admin/*` route | 403; redirect away; no data exposed | integration + browser-verify |
| AC5 | Admin opens a KYC document link | clicks document | a signed URL is generated and expires (e.g. 5 min); document not publicly accessible without it | integration |
| AC6 | Profile already approved | second "Approve" call | 409 `{ error:"ALREADY_APPROVED" }`; idempotent state | integration |

**Error cases:**

| Case | Expected behavior | Verify |
|------|------------------|--------|
| Non-admin access | 403; logged | integration + browser-verify |
| Reject without reason | 400; reason mandatory | integration |
| Approve a non-existent id | 404 | integration |
| Document fetch after link expiry | 403/expired; admin must regenerate | integration |

**Known pitfalls to anticipate:**

- Enforce the admin role on the **server** for every `/admin/*` and `/api/admin/*` route — never rely on hiding UI.
- KYC documents must be served only via short-lived signed URLs from a private bucket.
- Log every approve/reject/suspend with actor + timestamp for auditability.

**Dependencies:** F3 (supplies pending profiles + docs), F6 (admin role), email provider.

**Out of scope for this feature:** Automated KYC/AML checks, payment refunds, analytics dashboards.

---

### F6 · Auth & accounts (roles) — P0

**User story:** As any user, I want to create an account and log in with the correct role, so I can access the right capabilities (shipper / forwarder / admin).

**Description:** Email + password auth with email verification. A single account model with a `role` field. Shippers can browse without an account but must provide contact details on inquiry; account is optional for shippers in v1 (ASSUMPTION — confirm). Forwarders require an account to register a profile. Admin accounts are provisioned manually (no public admin signup).

**Routes & network:**

| Route | Method | Purpose | Expected status |
|-------|--------|---------|-----------------|
| `/register` | GET/POST | Account creation (role=shipper or forwarder) | 200/201, 400, 409 (email taken) |
| `/login` | GET/POST | Session login | 200, 401 |
| `/verify-email?token=` | GET | Confirms email | 200, 400 (bad/expired token) |
| `/logout` | POST | Ends session | 200 |

**Acceptance criteria:**

| # | Given | When | Then | Verify |
|---|-------|------|------|--------|
| AC1 | New visitor on `/register` | submits valid email+password, role=forwarder | 201; verification email sent; session established or prompted to verify; zero console errors | integration + browser-verify |
| AC2 | Email already registered | submits same email | 409 `{ error:"EMAIL_TAKEN" }`; inline message | integration |
| AC3 | Unverified user | tries to submit a forwarder profile | blocked with "verify your email first" prompt | browser-verify |
| AC4 | Valid credentials | logs in | 200; session cookie set (httpOnly, secure); redirected to role landing | integration + browser-verify |
| AC5 | Wrong password | logs in | 401; generic "invalid credentials" (no user-enumeration leak) | integration |

**Error cases:**

| Case | Expected behavior | Verify |
|------|------------------|--------|
| Weak password | 400 with policy message | integration |
| Expired verification token | 400; offer resend | integration + browser-verify |
| Brute-force login | Rate-limit / lockout after N attempts | integration |

**Known pitfalls to anticipate:**

- Hash passwords (bcrypt/argon2); never store plaintext.
- Use httpOnly, secure, sameSite cookies for sessions.
- Avoid user-enumeration: identical error + timing for unknown email vs wrong password.

**Dependencies:** Email provider, session store.

**Out of scope for this feature:** SSO/OAuth, 2FA, password-less (Future).

---

### F7 · Forwarder dashboard (profile edit + inquiries inbox) — P1

**User story:** As a forwarder, I want a dashboard to edit my profile and see inquiries, so I can keep my listing current and respond to leads.

**Description:** Authenticated area where a forwarder edits their (already-approved or draft) profile and views received inquiries (read-only list with shipper contact + lane details). Editing an approved profile's material fields may re-trigger review (ASSUMPTION — confirm whether edits go back to `pending`).

**Routes & network:**

| Route | Method | Purpose | Expected status |
|-------|--------|---------|-----------------|
| `/dashboard` | GET | Forwarder home (profile status + inquiry count) | 200, 401 |
| `/dashboard/profile` | GET | Edit profile | 200, 401 |
| `/dashboard/inquiries` | GET | Inquiry inbox | 200, 401 |
| `/api/forwarders/:id` | PATCH | Save edits | 200, 400, 403 |

**Acceptance criteria:**

| # | Given | When | Then | Verify |
|---|-------|------|------|--------|
| AC1 | Logged-in forwarder with inquiries | visits `/dashboard/inquiries` | their inquiries list (and only theirs) renders; 200; zero console errors | browser-verify |
| AC2 | Forwarder edits "about" and saves | clicks Save | `PATCH` 200; change persisted; success toast | browser-verify |
| AC3 | Forwarder A | opens `/dashboard` while logged out | 401 → redirect `/login` | browser-verify |
| AC4 | Forwarder A | requests forwarder B's inquiries via API | 403; no data | integration |

**Error cases:**

| Case | Expected behavior | Verify |
|------|------------------|--------|
| Unauthenticated | 401; redirect | browser-verify |
| Cross-tenant access | 403 | integration |
| Invalid edit | 400 inline | integration + browser-verify |

**Known pitfalls to anticipate:**

- Scope every query to the authenticated forwarder's id.
- Decide and document whether profile edits re-enter the review queue (see Open Questions).

**Dependencies:** F3, F4, F6.

**Out of scope for this feature:** Analytics, billing, messaging.

---

### F8 · Search by trade lane & port (origin→destination) — P1

**User story:** As a shipper, I want to search by origin→destination lane, so I find forwarders that specifically cover my route.

**Description:** Extends F1 with a lane-aware query: origin country/port + destination country/port. Matches forwarders whose `tradeLanes` or `countriesServed` cover both endpoints. Reflects the "sea/air route" navigation prominent on JCtrans. <cite index="12-1">The platform organizes discovery around popular sea and air freight routes between regions.</cite>

**Acceptance criteria:**

| # | Given | When | Then | Verify |
|---|-------|------|------|--------|
| AC1 | On `/forwarders` lane search | sets origin=CN, destination=DE | `GET /api/forwarders?originCountry=CN&destinationCountry=DE` 200; results cover that lane; URL reflects it | browser-verify |
| AC2 | No forwarder covers the lane | search runs | empty state; 200 `results:[]` | browser-verify |

**Known pitfalls:** Lane matching can be ambiguous (covers country vs. specific port) — define match precedence explicitly. **Dependencies:** F1, F2.

---

### F9 · Reviews / ratings — P2

**User story:** As a shipper, I want to rate a forwarder after contact, so others can judge reliability.

**Description:** Post-inquiry, a shipper may leave a 1–5 rating + comment. Aggregate shows on profile. Requires anti-abuse (one review per inquiry, moderation). **Deferred to P2** — documented for completeness, not built in v1 unless prioritized.

**Acceptance criteria (when built):**

| # | Given | When | Then | Verify |
|---|-------|------|------|--------|
| AC1 | Shipper who sent an inquiry ≥X days ago | submits a 4-star review | review persisted, pending moderation; aggregate updates after approval | integration |

**Known pitfalls:** Verify the reviewer actually transacted; prevent self-reviews and competitor sabotage. **Dependencies:** F4, F5 (moderation).

---

## 5. Data model

### Entities

| Entity | Description | Key fields |
|--------|-------------|------------|
| User | Account with a role | id, email, passwordHash, role (`shipper`/`forwarder`/`admin`), emailVerified, createdAt |
| ForwarderProfile | A freight forwarder's listing | id, ownerUserId, slug, companyName, primaryCountry, yearEstablished, websiteUrl, about, logoUrl, status (`draft`/`pending`/`approved`/`rejected`/`suspended`), verified, createdAt, reviewedBy, reviewedAt, rejectionReason |
| CountryCoverage | One country a forwarder serves | id, forwarderId, country, city, isHeadquarters, ports[] |
| TradeLane | A lane a forwarder covers | id, forwarderId, originCountry, destinationCountry |
| KycDocument | Uploaded verification doc (private) | id, forwarderId, type, storageKey, mimeType, sizeBytes, uploadedAt |
| Inquiry | A shipper's structured request | id, forwarderId, shipperName, shipperEmail, shipperCompany, originCountry, originPort, destinationCountry, destinationPort, mode, cargoType, message, status (`sent`/`queued`/`failed`), createdAt |
| Taxonomy (Country, Port, Mode, Service) | Reference/lookup data | code, label, (port: countryCode) |
| Review (P2) | Shipper rating | id, forwarderId, inquiryId, rating, comment, status, createdAt |

### Relationships

- A `User` (role=forwarder) has one `ForwarderProfile` (1:1 in v1; ASSUMPTION — one company per account).
- A `ForwarderProfile` has many `CountryCoverage`, many `TradeLane`, many `KycDocument`, many `Inquiry`.
- An `Inquiry` belongs to one `ForwarderProfile`; shipper may be anonymous (no User row required in v1).
- `modes` and `services` on a profile are arrays referencing Taxonomy codes.

### Example record

```json
{
  "ForwarderProfile": {
    "id": "f_01H...",
    "ownerUserId": "u_01H...",
    "slug": "acme-logistics-de",
    "companyName": "ACME Logistics GmbH",
    "primaryCountry": "DE",
    "status": "approved",
    "verified": true,
    "modes": ["sea_fcl", "air"],
    "services": ["customs_clearance"],
    "createdAt": "2026-06-02T10:00:00Z"
  }
}
```

### Constraints & invariants

- `slug` is unique and immutable once approved.
- A profile is publicly visible (F1/F2) **only** when `status = approved`.
- `verified = true` implies `status = approved` (never verified while pending/rejected).
- KYC documents are never exposed on any public endpoint.
- An `Inquiry` is persisted before any email send is attempted.

---

## 6. External integrations

| Service | Purpose | Auth | Rate limits / quotas | Error mode |
|---------|---------|------|---------------------|-----------|
| Transactional email (e.g. Resend/SES/Postmark) | Inquiry notifications, approval/rejection, email verification | API key (server-side) | Provider-dependent | Persist first; queue + retry on failure; never lose a lead |
| Object storage (e.g. S3-compatible) | Private KYC document storage + signed URLs | IAM/key | n/a | Fail upload with 5xx; no orphaned DB record without object |
| (Optional) Captcha (e.g. hCaptcha/Turnstile) | Inquiry/registration spam protection | site+secret key | Provider-dependent | Fail closed on verification error for inquiry submit |

<!-- ASSUMPTION: specific providers are TODO. The PRD treats them as interfaces, not commitments. -->

---

## 7. Non-functional requirements

### Performance

- Directory search (`/api/forwarders`) p95 < 500 ms at up to 10k profiles (requires indexed filter columns).
- Profile page SSR p95 < 800 ms.

### Security & auth

- Auth model: session cookies (httpOnly, secure, sameSite=lax), role-based access enforced server-side on every protected route.
- Secrets management: all provider keys in environment/secret store, never in client bundle.
- Sensitive data: KYC documents are PII-adjacent business records → private bucket, signed URLs, access-logged. Shipper inquiry contact details are PII → not publicly listed.

### Compliance

- GDPR-aware (EU forwarders/shippers likely): support data export + deletion request for accounts; document a retention policy for KYC docs and inquiries. <!-- TODO: confirm jurisdictions; this is an ASSUMPTION given EU references. -->

### Accessibility

- Target: WCAG 2.1 AA on public pages (directory, profile, inquiry form).

### Observability

- Log auth events, admin moderation actions (actor + timestamp), inquiry send success/failure.
- Track: # profiles by status, # inquiries/day, search→profile→inquiry funnel.

---

## 8. Success metrics

### Launch criteria (how we know v1 is "done")

- [ ] All P0 acceptance criteria pass
- [ ] All `browser-verify` ACs return PASS from the browser-verifier
- [ ] A forwarder can register → submit → be approved → appear in directory → receive an inquiry end-to-end
- [ ] No KYC document is reachable without a signed URL
- [ ] Admin role is enforced server-side on every `/admin/*` route

### Post-launch metrics

| Metric | Target | How we measure |
|--------|--------|---------------|
| Approved forwarder profiles | TODO: set target (e.g. 100 in 90 days) | count where status=approved |
| Inquiry submission rate | TODO (e.g. ≥5% of profile views) | inquiries / profile pageviews |
| Inquiry → forwarder response (qualitative) | Positive feedback from a sample of forwarders | follow-up survey |

---

## 9. Glossary

| Term | Definition |
|------|-----------|
| Forwarder / freight forwarder | A company that arranges shipment of goods on behalf of shippers; the *registering* party (persona B). |
| Shipper / cargo owner | The party with goods to move who *searches* for a forwarder (persona A). May be an importer, exporter, or another forwarder seeking a destination agent. |
| Profile | A forwarder's public listing (ForwarderProfile entity). |
| Verified | An admin-approved profile that passed KYC review; drives the trust badge. Not the same as merely "registered." |
| KYC | "Know Your Customer" — the document-based vetting step before a profile goes public. |
| Trade lane / lane | A directional route between an origin and destination (country and/or port), e.g. CN→DE. |
| Mode | Transport mode: Sea FCL, Sea LCL, Air, Rail, Road, Intermodal. |
| Service / advantage | A capability a forwarder offers: customs clearance, warehousing, project cargo, reefer, dangerous goods, etc. |
| Inquiry | A shipper's structured contact request sent to a forwarder (does not include on-platform messaging in v1). |
| Directory | The searchable public list of approved forwarder profiles. |

---

## 10. Open questions

- [ ] Do shippers need accounts, or is anonymous inquiry (email only) acceptable for v1? (Current ASSUMPTION: anonymous allowed.)
- [ ] When an approved forwarder edits material profile fields, does the profile re-enter the review queue?
- [ ] One profile per account, or can one account manage multiple company profiles?
- [ ] Monetization timing — does any paid tier or featured listing land in v1, or strictly free?
- [ ] Which jurisdictions/compliance regimes are in scope at launch (drives GDPR/retention handling)?
- [ ] Email + captcha provider selection.
- [ ] Multi-language: English-only v1 confirmed?

---

## Recommended tech stack

<!-- This section is advisory for the human; Claude Code will read scope/ACs above to build. -->

| Layer | Recommendation | Why |
|-------|----------------|-----|
| Framework | **Next.js (App Router) + TypeScript** | SSR for SEO-critical directory/profile pages (organic discovery is the growth engine), one codebase for UI + API routes, strong fit with the browser-verifier/`/verify` workflow. |
| Styling/UI | **Tailwind CSS + shadcn/ui** | Fast, consistent, accessible component primitives. |
| Database | **PostgreSQL** | Relational data (profiles, coverage, lanes, inquiries) with the array/JSONB flexibility needed for modes/services; strong indexing for filtered search. |
| ORM | **Prisma** (or Drizzle) | Typed schema mapping the entities in §5; migrations. |
| Search (v1) | **Postgres full-text + indexed filters**; upgrade to **Meilisearch/Typesense** if free-text relevance becomes a need | Avoid premature search infra; the filter-first directory is satisfiable in Postgres at v1 scale. |
| Auth | **Auth.js (NextAuth)** credentials provider, or **Lucia** | Session cookies, role field, email verification; avoids rolling your own. |
| File storage | **S3-compatible** (AWS S3 / Cloudflare R2) + signed URLs | Private KYC docs. |
| Email | **Resend / Postmark / SES** | Transactional notifications + verification. |
| Hosting | **Vercel** (app) + managed Postgres (Neon/Supabase/RDS) + R2/S3 | Matches Next.js; the connected Netlify connector is also viable if you prefer it. |
| Spam control | **Cloudflare Turnstile / hCaptcha** + server rate limiting | Protect inquiry + registration. |
| Testing | **Vitest/Jest** (unit/integration) + **Playwright** (browser-verify) | Directly powers the `/verify` ACs above. |

> This pairs with the **agentic-project-scaffold** skill: drop this PRD into `docs/PRD.md`, run the scaffold, and each `browser-verify` AC becomes runnable from session one.

---

## Appendix A — Competitive references studied

| Site | What we took as a pattern | What we deliberately left out of v1 |
|------|---------------------------|-------------------------------------|
| df-alliance.com | Verified-member network framing; KYC application step; community/directory | Logistics financing, payment deferral, insurance, rate engine |
| searates.com | Company page to showcase services + attract shippers; route/mode discovery | Live rate comparison, 3D load calculator, tracking, booking |
| wcaworld.com | Strict pre-acceptance screening as the trust mechanism; global directory by country | Financial protection program, academy, conferences, membership tiers |
| jctrans.com | Company directory with rich profiles, advantage labels, inquiry board, search by route/mode/cargo | Risk protection, JC Pay settlement, insurance, FMC/customs filing, events |
| twignetwork.com | Curated/limited membership per country, member selection, profile-driven matching | Conferences (Twig Talk), rewards programs, business-intelligence module |

## Appendix B — Changelog

| Version | Date | Change |
|---------|------|--------|
| v1 | 2026-06-02 | Initial draft from competitive study of five reference platforms |
