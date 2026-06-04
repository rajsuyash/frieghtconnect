---
description: Review the current branch diff using the code-reviewer subagent. Run this before opening a PR.
allowed-tools: ["Task", "Bash(git diff *)", "Bash(git log *)", "Bash(git status *)"]
---

# Code review

## Branch status

!`git status --short`

## Commits on this branch

!`git log --oneline main..HEAD 2>/dev/null || git log --oneline -5`

## Changed files

!`git diff --name-only main...HEAD 2>/dev/null || git diff --name-only HEAD~5`

---

Delegate the full review to the `code-reviewer` subagent. Pass it the branch diff and the relevant convention docs. Return its findings verbatim, then add a one-paragraph summary at the end with your own take on whether the findings are fair and what to prioritize first.
