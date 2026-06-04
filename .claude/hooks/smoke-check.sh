#!/usr/bin/env bash
# .claude/hooks/smoke-check.sh
#
# Stop hook — runs after every Claude response. Web surface (Next.js).
#
# Three jobs:
#   1. Health-check the dev server if reachable
#   2. Scan .claude/dev-server.log for known runtime error signatures
#   3. Print the evidence-pack reminder
#
# Fast (<2s) and non-blocking — exits 0 even on failure so Claude can address
# issues in the next turn rather than getting stuck.

set -uo pipefail

DEV_URL="${DEV_URL:-http://localhost:3000}"
LOG_FILE=".claude/dev-server.log"
HAD_ISSUE=0

# --- 1. Dev server health ---
if command -v curl >/dev/null 2>&1; then
  HTTP_CODE=$(curl -sf -o /dev/null -w "%{http_code}" --max-time 3 "$DEV_URL" 2>/dev/null || echo "000")
  if [[ "$HTTP_CODE" == "200" || "$HTTP_CODE" == "304" ]]; then
    echo "✓ Dev server responding at $DEV_URL ($HTTP_CODE)"
  elif [[ "$HTTP_CODE" == "000" ]]; then
    echo "ℹ️  Dev server not running on $DEV_URL"
    echo "   Start it with: pnpm dev 2>&1 | tee $LOG_FILE"
  else
    echo "⚠️  Dev server returned $HTTP_CODE on $DEV_URL"
    HAD_ISSUE=1
  fi
fi

# --- 2. Scan dev-server.log for known error signatures ---
if [[ -f "$LOG_FILE" ]]; then
  ERRORS=$(tail -200 "$LOG_FILE" 2>/dev/null | grep -iE \
    "Hydration failed|ReferenceError|TypeError|is not defined|Module not found|ENOENT|EADDRINUSE|Unhandled (Promise )?[Rr]ejection|Cannot read propert|Failed to compile|SyntaxError|PrismaClient|P10[0-9][0-9]" \
    | tail -10 || true)
  if [[ -n "$ERRORS" ]]; then
    echo ""
    echo "⚠️  Recent runtime errors in $LOG_FILE:"
    echo "$ERRORS" | sed 's/^/   /'
    echo "   → Address before claiming done."
    HAD_ISSUE=1
  fi
fi

# --- 3. Evidence reminder ---
echo ""
if [[ $HAD_ISSUE -eq 1 ]]; then
  echo "❌ Smoke-check found issues — fix before declaring done."
else
  echo "📋 Before claiming done, post the evidence pack:"
  echo "   Always: Typecheck pass | Lint pass | Tests <count>"
  echo "   Web changes: + /verify result, console errors: 0, screenshot path"
fi

exit 0
