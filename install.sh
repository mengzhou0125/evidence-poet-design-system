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

# --- Version comparison · silent update if newer ---
extract_version() {
  # Extracts semver "version": "MAJOR.MINOR.PATCH" from a design.md JSON block. Empty if missing.
  grep -E '^\s*"version"\s*:' "$1" 2>/dev/null | head -1 | sed -E 's/.*"version"\s*:\s*"([^"]+)".*/\1/'
}

# semver_cmp A B → echoes -1 if A<B · 0 if A==B · 1 if A>B · "?" if either not parseable
semver_cmp() {
  local a="$1" b="$2"
  if ! [[ "$a" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] || ! [[ "$b" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "?"; return
  fi
  IFS='.' read -r a1 a2 a3 <<< "$a"
  IFS='.' read -r b1 b2 b3 <<< "$b"
  for pair in "$a1 $b1" "$a2 $b2" "$a3 $b3"; do
    set -- $pair
    if [ "$1" -lt "$2" ]; then echo "-1"; return; fi
    if [ "$1" -gt "$2" ]; then echo "1"; return; fi
  done
  echo "0"
}

SOURCE_VERSION="$(extract_version "$SOURCE/reference/design.md")"

if [ -d "$TARGET" ]; then
  TARGET_VERSION="$(extract_version "$TARGET/reference/design.md")"
  CMP="$(semver_cmp "$SOURCE_VERSION" "$TARGET_VERSION")"

  case "$CMP" in
    "?")
      echo "Skill already installed at: $TARGET (cannot determine version)"
      printf "Overwrite with latest? [y/N] "
      read -r yn </dev/tty || yn="n"
      case "$yn" in
        [Yy]*) rm -rf "$TARGET" ;;
        *) echo "Aborted. No changes made."; [ -n "$CLEANUP_DIR" ] && rm -rf "$CLEANUP_DIR"; exit 0 ;;
      esac
      ;;
    "0")
      echo "✓ Skill already at v$TARGET_VERSION · no update needed."
      [ -n "$CLEANUP_DIR" ] && rm -rf "$CLEANUP_DIR"
      exit 0
      ;;
    "1")
      echo "→ Updating skill: v$TARGET_VERSION → v$SOURCE_VERSION"
      rm -rf "$TARGET"
      ;;
    "-1")
      echo "⚠ Local skill (v$TARGET_VERSION) is newer than source (v$SOURCE_VERSION)."
      printf "Downgrade? [y/N] "
      read -r yn </dev/tty || yn="n"
      case "$yn" in
        [Yy]*) rm -rf "$TARGET" ;;
        *) echo "Aborted. No changes made."; [ -n "$CLEANUP_DIR" ] && rm -rf "$CLEANUP_DIR"; exit 0 ;;
      esac
      ;;
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
echo "✓ Installed: $TARGET (v$SOURCE_VERSION)"
echo ""
echo "Next: in any frontend project, tell Claude Code one of:"
echo "    install DNA1 into this project"
echo "    导入证据诗人设计规范"
echo "    /install-dna1"
echo ""
echo "The skill will copy the DNA1 spec into the project's .claude/design.md"
echo "and register a directive in the project's CLAUDE.md, so future Claude"
echo "sessions automatically follow the design standard."
