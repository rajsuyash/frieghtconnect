#!/usr/bin/env bash
# mark-verified.sh
# Hook event: PostToolUse  (matcher: Bash)
#
# If the Bash command matches a known verification pattern (test/typecheck/
# lint/build), touch the marker file. The Stop hook and pre-commit hook read
# this marker to decide whether verification ran recently enough.
#
# Requires: jq (parses the JSON Claude Code passes on stdin).

set -euo pipefail

INPUT="$(cat || true)"
COMMAND="$(printf '%s' "$INPUT" | jq -r '.tool_input.command // empty' 2>/dev/null || true)"

[ -z "$COMMAND" ] && exit 0

# Patterns that count as "verification ran" — pnpm/npm/yarn scripts + direct binaries.
VERIFY_REGEX='\b(pnpm|npm|yarn|bun)[[:space:]]+(test|typecheck|tc|lint|build|check|ci)\b|\btsc\b|\beslint\b|\bvitest\b|\bplaywright[[:space:]]+test\b'

if printf '%s' "$COMMAND" | grep -qE "$VERIFY_REGEX"; then
  mkdir -p .claude/state
  touch .claude/state/last-verified
fi

exit 0
