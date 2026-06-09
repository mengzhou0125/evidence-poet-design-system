#!/usr/bin/env bash
#
# sync-spec.sh — DNA1 spec mirror drift check
#
# Canonical:  skills/evidence-poet-installer/reference/design.md
# Mirrors:    skills/evidence-poet-builder/references/dna1-spec.md
#             skills/evidence-poet-diagram/references/dna1-spec.md
#             skills/evidence-poet-review/references/dna1-spec.md
#
# Usage:
#   ./scripts/sync-spec.sh           # check · exit 1 if any mirror drifts
#   ./scripts/sync-spec.sh --fix     # overwrite mirrors with canonical
#
# Run after editing the canonical spec, before committing. Wire into CI to gate PRs.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CANONICAL="$REPO_ROOT/skills/evidence-poet-installer/reference/design.md"
MIRRORS=(
  "$REPO_ROOT/skills/evidence-poet-builder/references/dna1-spec.md"
  "$REPO_ROOT/skills/evidence-poet-diagram/references/dna1-spec.md"
  "$REPO_ROOT/skills/evidence-poet-review/references/dna1-spec.md"
)

if [ ! -f "$CANONICAL" ]; then
  echo "✗ Canonical spec not found: $CANONICAL" >&2
  exit 2
fi

FIX=0
if [ "${1:-}" = "--fix" ]; then FIX=1; fi

DRIFT=0
for mirror in "${MIRRORS[@]}"; do
  if [ ! -f "$mirror" ]; then
    echo "✗ Mirror missing: $mirror" >&2
    DRIFT=1
    if [ "$FIX" = "1" ]; then
      mkdir -p "$(dirname "$mirror")"
      cp "$CANONICAL" "$mirror"
      echo "  → copied from canonical"
    fi
    continue
  fi
  if ! diff -q "$CANONICAL" "$mirror" > /dev/null; then
    rel="${mirror#$REPO_ROOT/}"
    echo "✗ Drift: $rel"
    DRIFT=1
    if [ "$FIX" = "1" ]; then
      cp "$CANONICAL" "$mirror"
      echo "  → overwritten with canonical"
    fi
  fi
done

if [ "$DRIFT" = "0" ]; then
  echo "✓ All ${#MIRRORS[@]} spec mirrors in sync with canonical"
  exit 0
fi

if [ "$FIX" = "1" ]; then
  echo ""
  echo "✓ Fixed · re-run without --fix to verify"
  exit 0
fi

echo ""
echo "Mirror drift detected. To fix:"
echo "  ./scripts/sync-spec.sh --fix"
exit 1
