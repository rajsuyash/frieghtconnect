# Skill Routing (mandatory)

This file defines which skills MUST be invoked for which kinds of work in
this project. CLAUDE.md references this file via `@docs/skill-routing.md` —
when you load CLAUDE.md, this table comes with it as part of the project
contract.

If a trigger below matches the current task, the listed skill MUST run.
These are not suggestions. Two enforcement hooks back this up:
`.claude/hooks/stop-verify.sh` (soft warning at end of turn) and
`.claude/hooks/pre-commit-gate.sh` (hard block on `git commit`).

## BASE — every coding task

| Trigger | Skill |
|---|---|
| Writing new code, features, or bug fixes | `tdd-workflow` |
| Researching libraries, framework APIs, error messages, package versions | `search-first` |
| Delegating any sub-task to a subagent (Task tool) | `iterative-retrieval` |
| Before declaring ANY task done / ready / shipped / complete | `verification-loop` |
| Long sessions — turn count >30 OR context >50% used | `strategic-compact` |

## WEB APP surface

| Trigger | Skill |
|---|---|
| Writing browser tests or critical user flow tests | `e2e-testing` |
| Adding or modifying any REST endpoint, Route Handler, or API contract | `api-design` |
| DB schema changes, new Prisma migrations, or refactoring data access | `database-migrations` |
| Adding LLM calls or AI features (model routing, fallback, budget) | `cost-aware-llm-pipeline` |
| Parsing structured text from LLM output or files | `regex-vs-llm-structured-text` |

> Note: this project's "API surface" is Next.js Route Handlers inside the same
> app, not a separate backend service. `e2e-testing` here covers both Playwright
> browser flows and HTTP integration tests against those handlers.

## Routing rules

- If multiple triggers match, run **all** matching skills in the order listed.
- `verification-loop` is enforced by hooks. `.claude/hooks/stop-verify.sh`
  warns when you end a turn after editing source without running
  verification. `.claude/hooks/pre-commit-gate.sh` blocks `git commit` if
  verification hasn't run since the last source edit.
- If `search-first` is bypassed and Claude hallucinates an API or a version,
  that's a routing failure — back out, re-run with `search-first` invoked.
- Subagent delegations MUST use `iterative-retrieval` to avoid the
  subagent-context-loss problem (subagent making decisions on incomplete
  context, then reporting confident wrong answers).
- The reviewer agents (`typescript-reviewer`), `database-reviewer`, and
  `build-error-resolver` live in `~/.claude/agents/` and are invoked via the
  Task tool, not via this routing table.

---

See also: `CLAUDE.md` (project context, Definition of done, hard rules),
`docs/conventions.md` (code style), `docs/known-pitfalls.md`
(surface-specific gotchas).
