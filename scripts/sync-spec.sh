#!/usr/bin/env bash
#
# sync-spec.sh — Evidence Poet spec mirror drift check (intra-repo only)
#
# Canonical:  skills/evidence-poet-installer/reference/design.md
# Mirror:     skills/evidence-poet-builder/references/spec.md
#
# (As of the 3-repo split, the diagram + review skills moved to separate repos
# with their own bundled Evidence Poet mirrors at specs/default-spec.md. Cross-repo spec
# sync is currently MANUAL — see "Cross-repo sync" below. This script only
# covers the in-repo mirror.)
#
# Usage:
#   ./scripts/sync-spec.sh           # check · exit 1 if mirror drifts
#   ./scripts/sync-spec.sh --fix     # overwrite mirror with canonical
#
# Run after editing the canonical spec, before committing.
#
# ── Cross-repo sync (manual until automated) ──
# When this canonical spec changes, the bundled defaults in the two sibling
# repos need to be re-synced:
#   - https://github.com/mengzhou0125/svg-diagram-skill   · specs/default-spec.md
#   - https://github.com/mengzhou0125/html-review-skill · specs/default-spec.md
# Do this by hand (cp + commit + push in each clone) after editing here.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CANONICAL="$REPO_ROOT/skills/evidence-poet-installer/reference/design.md"
MIRRORS=(
  "$REPO_ROOT/skills/evidence-poet-builder/references/spec.md"
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
