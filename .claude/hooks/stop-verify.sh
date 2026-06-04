#!/usr/bin/env bash
# stop-verify.sh
# Hook event: Stop  (fires at end of every Claude turn)
#
# SOFT enforcement of `verification-loop`. If source files were edited but no
# verification command has run since the last edit, surface a reminder via
# stderr (exit 2 routes the message back into the model's context for the next
# turn). Does not hard-block — that's the pre-commit hook's job.

set -euo pipefail

SOURCE_PATTERN='\.(ts|tsx|js|jsx|mjs|cjs)$'
MARKER='.claude/state/last-verified'

# If we're not in a git repo we can't tell what changed — bail.
git rev-parse --git-dir >/dev/null 2>&1 || exit 0

# Find changed source files (working tree + staged, vs HEAD).
CHANGED="$(git diff --name-only HEAD 2>/dev/null | grep -E "$SOURCE_PATTERN" || true)"
[ -z "$CHANGED" ] && exit 0

# If the verified marker is newer than every changed file, we're good.
if [ -f "$MARKER" ]; then
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
  [ "$STALE" -eq 0 ] && exit 0
fi

# Otherwise, route a reminder back to the model.
cat >&2 <<'MSG'
[stop-verify] Source files were edited this session, but no verification
command has run since the last edit (test / typecheck / lint / build).

Before declaring this task complete:
  1. Invoke the `verification-loop` skill, OR
  2. Run: pnpm typecheck && pnpm lint && pnpm test

Source-edited-but-not-verified is the #1 cause of UAT failures in this
scaffold. This is a soft warning — `git commit` will hard-block via
pre-commit-gate.sh until verification runs.
MSG
exit 2
