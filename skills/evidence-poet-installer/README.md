# evidence-poet-installer

One-shot installer that wires the **DNA1 ("Evidence Poet")** design system into any
frontend project. After install, the project's own `CLAUDE.md` tells future Claude sessions
to follow DNA1 for any frontend work — the skill doesn't need to load again.

## Install just this skill

```bash
git clone https://github.com/mengzhou0125/evidence-poet-design-system.git
cd evidence-poet-design-system
./install.sh installer          # macOS / Linux / Git Bash
.\install.ps1 installer         # Windows PowerShell
```

Or install the whole ecosystem with `./install.sh` (no args).

## Trigger it

```
install DNA1 into this project
把 DNA1 装到这个工程
导入证据诗人设计规范
/install-dna1
```

## What it does

1. Verifies the target is a frontend project (`package.json` / `index.html` / `src/`)
2. Compares `reference/design.md` version against any existing `<project>/.claude/design.md`
3. Copies the spec into `<project>/.claude/design.md`
4. Registers a directive block in `<project>/CLAUDE.md` (sentinel-marked · idempotent)

Version comparison is semver-aware. Already at the latest version → no-op. Project has a
newer version than the skill → warns before overwriting.

## What it does NOT do

- Does not refactor existing code to comply with DNA1
- Does not audit the project (use `evidence-poet-auditor` for that)
- Does not install React components, runtime deps, or fonts
- Does not touch any file other than `.claude/design.md` and `CLAUDE.md`

## Files

- `SKILL.md` — Claude's manifest for this skill (trigger + workflow + steps)
- `reference/design.md` — canonical DNA1 spec (gets copied to target projects)
- `templates/claude_md_directive.md` — directive block appended to project's `CLAUDE.md`

## Where this fits

Lifecycle: **install → build → verify**. This is the **install** stage. After install, use
`evidence-poet-builder` to construct DNA1-compliant artifacts, and `evidence-poet-auditor`
to verify them before declaring done.
