---
description: Run the full pre-deploy gate. Invokes the production-readiness subagent (build + Lighthouse + bundle + a11y + security headers + dead code + secrets scan). Required before pushing to production.
---

# /ship — Pre-deploy production-readiness check

Use before merging to main or pushing to production. It invokes the `production-readiness` subagent, which runs every check that should be green before code reaches users.

## How to invoke

When the user says `/ship`:

1. **Confirm the dev server is stopped** and the working tree is clean (no uncommitted changes). If not, tell the user — don't ship dirty.

2. **Invoke `production-readiness`** via the Task tool. No arguments needed; it reads the project structure itself.

3. **Wait for the structured report.**

4. **Surface the report to the user verbatim** — the checklist is the value, don't summarize away the detail.

5. **If verdict is `BLOCK`** (secrets found, build failed, a11y < 95, SEO < 90): do not push. Address the blocking issues, re-run `/ship`.

6. **If verdict is `SHIP WITH FIXES`**: ask the user whether to address the listed actions first or ship and follow up. Default to fixing first.

7. **If verdict is `SHIP`**: confirm the deploy command and proceed (or hand off to the user).

## Caveats

- Lighthouse runs against the **production build served locally**, not the live site. Real-world numbers vary (CDN, network) but local Lighthouse catches what you control.
- Secrets scan is regex-based and will miss novel formats — a backstop, not a replacement for proper secret management.
- A `WARN` finding is not blocking — worth fixing eventually but doesn't stop the ship.
