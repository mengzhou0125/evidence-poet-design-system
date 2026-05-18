# evidence-poet-design-system

A Claude Code skill that installs the **DNA1 "Evidence Poet"** frontend design system into any project. After installation, every Claude session inside that project automatically follows the design standard for CSS, components, color, typography, spacing, and motion — no need to re-invoke the skill.

> **DNA1** is an academic-journal × architecture-magazine design language: sharp corners, three-font tension (serif headlines · sans body · mono labels), gold accents reserved for "worth-noticing" nodes, restrained motion. See [`reference/design.md`](reference/design.md) for the full spec.

---

## Install

### One-liner (macOS / Linux / Windows Git Bash)

```bash
curl -fsSL https://raw.githubusercontent.com/mengzhou0125/evidence-poet-design-system/main/install.sh | bash
```

### One-liner (Windows PowerShell)

```powershell
iex (irm https://raw.githubusercontent.com/mengzhou0125/evidence-poet-design-system/main/install.ps1)
```

### Clone & install

```bash
git clone https://github.com/mengzhou0125/evidence-poet-design-system.git
cd evidence-poet-design-system
./install.sh        # or .\install.ps1 on Windows
```

All three methods write the skill to `~/.claude/skills/evidence-poet-design-system/`. The installer is idempotent — re-running prompts before overwriting.

---

## Use

In any frontend project, tell Claude Code one of:

- `install DNA1 into this project`
- `导入证据诗人设计规范`
- `/install-dna1`

The skill will:

1. Verify the directory looks like a frontend project (`package.json` / `index.html` / source files).
2. Copy [`reference/design.md`](reference/design.md) → `<project>/.claude/design.md`.
3. Append a directive section to `<project>/CLAUDE.md` (delimited by `<!-- DNA1-DIRECTIVE-START/END -->` sentinels) instructing future Claude sessions to follow DNA1 for all frontend work.

After install, the project is self-sufficient. The skill itself does not need to load again unless you want to **update** to a newer spec — just re-run the same trigger and the installer will overwrite the local copy.

---

## What gets installed where

| File | Purpose |
|---|---|
| `~/.claude/skills/evidence-poet-design-system/SKILL.md` | Skill definition (Claude reads this to decide when to trigger) |
| `~/.claude/skills/evidence-poet-design-system/reference/design.md` | Canonical DNA1 spec — the master copy |
| `~/.claude/skills/evidence-poet-design-system/reference/react-bindings.md` | React/CSS-variable mapping (consulted on demand) |
| `~/.claude/skills/evidence-poet-design-system/templates/claude_md_directive.md` | The directive section injected into target projects' `CLAUDE.md` |

When the skill runs in a target project, it writes:

| File | Purpose |
|---|---|
| `<project>/.claude/design.md` | Project-local copy of the spec |
| `<project>/CLAUDE.md` (new or updated) | Contains DNA1 directive section |

---

## Update

```bash
# pull the latest, then re-install
cd /path/to/your/clone
git pull
./install.sh
# OR re-run the one-liner
```

Already-installed target projects keep their old copy of the spec — re-run the in-project trigger (`install DNA1 into this project`) to refresh.

---

## Uninstall

```bash
rm -rf ~/.claude/skills/evidence-poet-design-system
```

To remove DNA1 from a target project, delete `<project>/.claude/design.md` and remove the block between `<!-- DNA1-DIRECTIVE-START -->` and `<!-- DNA1-DIRECTIVE-END -->` in `<project>/CLAUDE.md`.

---

## What DNA1 enforces

- **Tokens** — all colors, fonts, spacing, easing, border-radius come from the spec's §0 JSON. No eyeballed hex values.
- **Type roles** — Playfair Display (serif) for headings, Plus Jakarta Sans for body, DM Mono for labels/nav/CTA. Roles are not interchangeable.
- **Sharp corners** — `border-radius: 0` globally.
- **Gold (`#C8A84B`) is signal, not decoration** — accent only, never as text color (fails WCAG 2.14:1).
- **Motion is invited** — single easing curve `cubic-bezier(0.16, 1, 0.3, 1)`, shadows on hover/active only, no parallax or auto-play without disclosure.

Full ruleset: [`reference/design.md`](reference/design.md) (§9 guardrails).

---

## Skill structure

```
evidence-poet-design-system/
├── SKILL.md                              skill definition (YAML frontmatter + installer instructions)
├── reference/
│   ├── design.md                         canonical spec — copied to target projects
│   └── react-bindings.md                 React mapping — consulted on demand
├── templates/
│   └── claude_md_directive.md            the directive injected into target CLAUDE.md
├── install.sh / install.ps1              installers
└── README.md                             this file
```

---

## License

The design spec and skill are released for use in your own projects. Attribution appreciated but not required.
