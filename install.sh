#!/usr/bin/env bash
#
# evidence-poet-design-system · installer
#
# Installs this skill into Claude Code's local skills directory
# (~/.claude/skills/evidence-poet-design-system/).
#
# Usage:
#   Local (after cloning):
#     ./install.sh
#
#   Remote one-liner:
#     curl -fsSL https://raw.githubusercontent.com/mengzhou0125/evidence-poet-design-system/main/install.sh | bash
#
# Requires: bash, git (only when run via curl | bash), cp.

set -euo pipefail

REPO_URL="https://github.com/mengzhou0125/evidence-poet-design-system.git"
SKILL_NAME="evidence-poet-design-system"
TARGET="$HOME/.claude/skills/$SKILL_NAME"

# --- Resolve source: local clone or fetch on-the-fly ---
SCRIPT_DIR=""
if [ -n "${BASH_SOURCE[0]:-}" ]; then
  SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" 2>/dev/null && pwd || echo "")"
fi

if [ -n "$SCRIPT_DIR" ] && [ -f "$SCRIPT_DIR/SKILL.md" ]; then
  SOURCE="$SCRIPT_DIR"
  CLEANUP_DIR=""
else
  command -v git >/dev/null || { echo "Error: 'git' required when running via curl | bash" >&2; exit 1; }
  TMPDIR="$(mktemp -d)"
  SOURCE="$TMPDIR/$SKILL_NAME"
  echo "→ Fetching skill from $REPO_URL ..."
  git clone --depth 1 --quiet "$REPO_URL" "$SOURCE"
  CLEANUP_DIR="$TMPDIR"
fi

# --- Idempotency check ---
if [ -d "$TARGET" ]; then
  echo "Skill already installed at: $TARGET"
  printf "Overwrite with latest? [y/N] "
  read -r yn </dev/tty || yn="n"
  case "$yn" in
    [Yy]*) rm -rf "$TARGET" ;;
    *) echo "Aborted. No changes made."; [ -n "$CLEANUP_DIR" ] && rm -rf "$CLEANUP_DIR"; exit 0 ;;
  esac
fi

# --- Install ---
mkdir -p "$(dirname "$TARGET")"
mkdir -p "$TARGET"

cp    "$SOURCE/SKILL.md"        "$TARGET/SKILL.md"
cp -r "$SOURCE/reference"       "$TARGET/reference"
cp -r "$SOURCE/templates"       "$TARGET/templates"

# Repo-meta files (README, LICENSE, install scripts, .git, internal CLAUDE.md)
# are intentionally NOT copied — they are not part of the skill runtime.

[ -n "$CLEANUP_DIR" ] && rm -rf "$CLEANUP_DIR"

# --- Done ---
echo ""
echo "✓ Installed: $TARGET"
echo ""
echo "Next: in any frontend project, tell Claude Code one of:"
echo "    install DNA1 into this project"
echo "    导入证据诗人设计规范"
echo "    /install-dna1"
echo ""
echo "The skill will copy the DNA1 spec into the project's .claude/design.md"
echo "and register a directive in the project's CLAUDE.md, so future Claude"
echo "sessions automatically follow the design standard."
