#!/usr/bin/env bash
#
# evidence-poet-design-system · installer for all 4 skills
# (installer · builder · auditor — the spec+distribution+verification triad ·
#  plus diagram — the SVG diagram-surface engine)
#
# Usage (from a local clone):
#   ./install.sh
#
# Idempotent — re-run to update.

set -euo pipefail

SKILL_DIR="$HOME/.claude/skills"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

mkdir -p "$SKILL_DIR"

for skill in evidence-poet-installer evidence-poet-builder evidence-poet-auditor evidence-poet-diagram; do
  target="$SKILL_DIR/$skill"
  source="$SCRIPT_DIR/skills/$skill"

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
echo "  · build something in DNA1     →  /build-dna1    (or  build a DNA1 component / page / etc.)"
echo "  · draw a DNA1 SVG diagram     →  /draw-dna1     (or  用 DNA1 画架构图 / 流程图 / 概念图)"
echo "  · audit a build for DNA1 drift → node ~/.claude/skills/evidence-poet-auditor/audit.mjs <path> --spec=<your-design.md>"
