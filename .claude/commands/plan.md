---
description: Produce an approved plan BEFORE writing any code. Forces the plan-then-build discipline that cuts error rates.
---

# Plan before building

The user's request: $ARGUMENTS

Before you write a single line of code, produce a plan with the following sections:

## 1. Understanding
Restate the request in your own words. Flag any ambiguity here — do not proceed if the goal is unclear.

## 2. Files affected
List every file you expect to create, modify, or delete. Mark each as `[CREATE]`, `[MODIFY]`, or `[DELETE]`.

## 3. Approach
Explain the approach in 3-6 bullets. Include:
- Which patterns from `@docs/conventions.md` apply
- Which architectural decisions / invariants from `@docs/architecture.md` and CLAUDE.md "Non-negotiable rules" constrain the approach
- Any assumptions you're making

## 4. Acceptance criteria
What does "done" look like? Write 3-5 concrete, testable criteria. Map to the relevant PRD ACs where applicable.

## 5. Test plan
For each acceptance criterion, what test verifies it (unit / integration / E2E / browser-verify)?

## 6. Risks
What could go wrong? What edge cases deserve attention?

## 7. Out of scope
What are you explicitly NOT doing in this change?

---

**Stop after producing the plan.** Wait for user approval before writing code. If the user says "go", proceed. If they request changes, revise the plan first.
