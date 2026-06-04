#!/usr/bin/env bash
# pre-commit-gate.sh
# Hook event: PreToolUse  (matcher: Bash)
#
# HARD enforcement. If Claude tries `git commit` and verification has not run
# since the last source edit, exit 2 to block the tool call entirely.
#
# Override: `git commit --no-verify` (deliberate, visible — docs/config-only).
# Requires: jq.

set -euo pipefail

SOURCE_PATTERN='\.(ts|tsx|js|jsx|mjs|cjs)$'
MARKER='.claude/state/last-verified'

INPUT="$(cat || true)"
COMMAND="$(printf '%s' "$INPUT" | jq -r '.tool_input.command // empty' 2>/dev/null || true)"
[ -z "$COMMAND" ] && exit 0

# Only fire on git commit.
printf '%s' "$COMMAND" | grep -qE '^[[:space:]]*git[[:space:]]+commit\b' || exit 0

# If user passed --no-verify, respect it.
printf '%s' "$COMMAND" | grep -qE '\B--no-verify\b' && exit 0

# If we're not in a git repo, nothing to gate.
git rev-parse --git-dir >/dev/null 2>&1 || exit 0

# Check what's actually being committed (staged files).
CHANGED="$(git diff --name-only --cached 2>/dev/null | grep -E "$SOURCE_PATTERN" || true)"
[ -z "$CHANGED" ] && exit 0

# No marker at all → block.
if [ ! -f "$MARKER" ]; then
  cat >&2 <<'MSG'
[pre-commit-gate] BLOCKED — no verification has run in this project.

Source files are staged for commit but the test/typecheck/lint/build gate
has never been recorded as passing. Run verification before committing:

  • Invoke the `verification-loop` skill, OR
  • Run: pnpm typecheck && pnpm lint && pnpm test

Override (deliberate): commit with `--no-verify`. Logged and visible —
only for docs/config-only commits where no source verification applies.
MSG
  exit 2
fi

# Marker exists but is older than at least one staged source file → block.
STALE=0
while IFS= read -r f; do
  [ -z "$f" ] && continue
  [ -f "$f" ] || continue
  if [ "$f" -nt "$MARKER" ]; then
    STALE=1
    break
  fi
done <<EOF
$CHANGED
EOF

if [ "$STALE" -eq 1 ]; then
  cat >&2 <<'MSG'
[pre-commit-gate] BLOCKED — staged source files were edited after the last
verification run.

Re-run verification before committing:
  • Invoke the `verification-loop` skill, OR
  • Run: pnpm typecheck && pnpm lint && pnpm test

Override (deliberate): `git commit --no-verify`. Use only for non-source
changes (docs, configs, generated files).
MSG
  exit 2
fi

exit 0
