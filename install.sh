#!/usr/bin/env bash
#
# evidence-poet-design-system · installer
#
# Usage (from a local clone):
#   ./install.sh                    # install all 3 skills (default)
#   ./install.sh installer          # install just one
#   ./install.sh installer builder  # install a subset
#
# Available skills (the Evidence Poet Design System lifecycle triad: install → build → verify):
#   installer · builder · auditor
#
# Two depth-specialist skills moved to separate repos with pluggable-spec support:
#   · SVG diagram surface     →  https://github.com/mengzhou0125/svg-diagram-skill
#   · Content-review HTML     →  https://github.com/mengzhou0125/html-review-skill
#
# Each name can be given with or without the "evidence-poet-" prefix.
# Idempotent — re-run to update.

set -euo pipefail

SKILL_DIR="$HOME/.claude/skills"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ALL_SKILLS=(evidence-poet-installer evidence-poet-builder evidence-poet-auditor)

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
      echo "  Available: installer · builder · auditor" >&2
      echo "  For diagram / review skills, see:" >&2
      echo "    https://github.com/mengzhou0125/svg-diagram-skill" >&2
      echo "    https://github.com/mengzhou0125/html-review-skill" >&2
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
echo "  · install Evidence Poet into a project →  /install-epds   (or  install Evidence Poet into this project)"
echo "  · build something in Evidence Poet     →  /build-epds     (or  build an Evidence Poet component / page / etc.)"
echo "  · audit a build for Evidence Poet drift → node ~/.claude/skills/evidence-poet-auditor/audit.mjs <path> --spec=<your-design.md>"
echo ""
echo "For SVG diagrams or content-review HTMLs (pluggable specs · Evidence Poet default):"
echo "  · SVG:    git clone https://github.com/mengzhou0125/svg-diagram-skill   && cd svg-diagram-skill   && ./install.sh"
echo "  · Review: git clone https://github.com/mengzhou0125/html-review-skill && cd html-review-skill && ./install.sh"
