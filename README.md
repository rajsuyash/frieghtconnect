# FreightConnect

A two-sided web marketplace where cargo shippers find and contact verified freight-forwarding agents, and forwarders register a vetted multi-country profile to receive inbound inquiries.

## Quick start

```bash
pnpm install
pnpm dev
```

Then open http://localhost:3000.

## Stack

- **Language:** TypeScript
- **Framework:** Next.js 15 (App Router)
- **Package manager:** pnpm
- **Database:** PostgreSQL + Prisma
- **Auth:** Auth.js (NextAuth) credentials provider with a `role` field
- **Storage:** S3-compatible (R2/S3) for private KYC documents
- **Email:** transactional provider (Resend / Postmark / SES)
- **Tests:** Vitest (unit/integration) + Playwright (E2E + browser-verify)
- **Deploy:** Vercel + managed Postgres (Neon/Supabase)

## Documentation

- [Product requirements](./docs/PRD.md)
- [Architecture](./docs/architecture.md)
- [Code conventions](./docs/conventions.md)
- [Testing strategy](./docs/test-strategy.md)
- [Known pitfalls](./docs/known-pitfalls.md)
- [Skill routing](./docs/skill-routing.md)
- [CLAUDE.md](./CLAUDE.md) — context for Claude Code

## Development

```bash
pnpm test          # run tests
pnpm typecheck     # type check
pnpm lint          # lint
pnpm build         # production build
```

## License

Proprietary — all rights reserved.
