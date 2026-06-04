---
description: Verify UI/runtime changes in a real browser. Invokes the browser-verifier subagent on the routes affected by the current diff. Required before claiming "done" on any UI/Route-Handler/runtime change.
---

# /verify — Browser-verify the current change

Use this after making changes that affect runtime behavior (UI, Route Handlers, business logic, database writes). It invokes the `browser-verifier` subagent, which:

1. Confirms the dev server is up at `http://localhost:3000`
2. Navigates the affected routes using Playwright MCP
3. Reads console messages (errors, warnings)
4. Captures screenshots to `.claude/screenshots/`
5. Returns a structured PASS/FAIL report

## How to invoke

If the user says `/verify`, do the following:

1. **Identify affected routes** from `git diff` since the last commit. Heuristic:
   - Files under `app/<route>/` → that route (e.g. `app/forwarders/` → `/forwarders`)
   - Shared layout / global component changes → home + 1 nested route
   - Route Handler changes (`app/api/...`) → the routes that call it (search for fetch calls)
   - If you can't determine, ask: "Which routes should I verify?"

2. **Invoke `browser-verifier`** via the Task tool with:
   ```
   Verify these routes after the recent change: <comma-separated list>
   Flow (if any): <what to click/submit, only if a multi-step flow was changed>
   ```

3. **Wait for the subagent's structured report.**

4. **Surface the result to the user verbatim.** Don't paraphrase the FATAL/ERROR list — copy it through. Then add one line of synthesis: "Verdict: PASS, ready to declare done" or "Verdict: FAIL, root cause likely <X>, fixing now."

5. If FAIL: do not declare the original task done. Address the failures in the next turn, then re-run `/verify`.

## When NOT to use

- Pure service/lib/CLI changes with no UI surface → use `/review` and `test-runner`
- Pure documentation edits
- Refactors with no behavior change AND green unit tests

For everything else that touches user-facing behavior, `/verify` is required before "done."
