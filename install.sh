#!/usr/bin/env bash
#
# evidence-poet-design-system · installer for both skills
#
# Usage (from a local clone):
#   ./install.sh
#
# Idempotent — re-run to update.

set -euo pipefail

SKILL_DIR="$HOME/.claude/skills"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

mkdir -p "$SKILL_DIR"

for skill in evidence-poet-installer evidence-poet-builder; do
  target="$SKILL_DIR/$skill"
  source="$SCRIPT_DIR/$skill"

  if [ ! -d "$source" ]; then
    echo "✗ Source not found: $source" >&2
    exit 1
  fi

  rm -rf "$target"
  cp -r "$source" "$target"
  echo "✓ Installed: $skill → $target"
done

echo ""
echo "Next:"
echo "  · install DNA1 into a project →  /install-dna1  (or  install DNA1 into this project)"
echo "  · build something in DNA1     →  /build-dna1    (or  build a DNA1 component / SVG / etc.)"
