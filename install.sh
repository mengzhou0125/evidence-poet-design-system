#!/usr/bin/env bash
#
# evidence-poet-design-system · installer
#
# Usage (from a local clone):
#   ./install.sh                    # install all 5 skills (default)
#   ./install.sh installer          # install just one
#   ./install.sh installer builder  # install a subset
#
# Available skills:
#   installer · builder · diagram · review · auditor
#
# Each name can be given with or without the "evidence-poet-" prefix.
# Idempotent — re-run to update.

set -euo pipefail

SKILL_DIR="$HOME/.claude/skills"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ALL_SKILLS=(evidence-poet-installer evidence-poet-builder evidence-poet-diagram evidence-poet-review evidence-poet-auditor)

mkdir -p "$SKILL_DIR"

# Resolve which skills to install.
if [ "$#" -eq 0 ]; then
  TO_INSTALL=("${ALL_SKILLS[@]}")
else
  TO_INSTALL=()
  for arg in "$@"; do
    # Allow short form ("installer") or full ("evidence-poet-installer")
    case "$arg" in
      evidence-poet-*) name="$arg" ;;
      *)               name="evidence-poet-$arg" ;;
    esac
    # Validate against known skills.
    found=""
    for s in "${ALL_SKILLS[@]}"; do
      if [ "$s" = "$name" ]; then found="$s"; break; fi
    done
    if [ -z "$found" ]; then
      echo "✗ Unknown skill: $arg" >&2
      echo "  Available: installer · builder · diagram · review · auditor" >&2
      exit 1
    fi
    TO_INSTALL+=("$found")
  done
fi

for skill in "${TO_INSTALL[@]}"; do
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
echo "  · install DNA1 into a project →  /install-dna1   (or  install DNA1 into this project)"
echo "  · build something in DNA1     →  /build-dna1     (or  build a DNA1 component / page / etc.)"
echo "  · draw a DNA1 SVG diagram     →  /draw-dna1      (or  用 DNA1 画架构图 / 流程图 / 概念图)"
echo "  · render a review HTML        →  /review-dna1    (or  用 DNA1 出 review)"
echo "  · audit a build for DNA1 drift → node ~/.claude/skills/evidence-poet-auditor/audit.mjs <path> --spec=<your-design.md>"
