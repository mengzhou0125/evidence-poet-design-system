# evidence-poet-auditor

Self-contained CLI + Claude skill for auditing artifacts against the Evidence Poet
design system spec. **0 npm dependencies** — pure Node.js stdlib.

12 check dimensions across 3 layers (Universal · Surface-modulated · Surface-specific) with
profile-based detection for 4 built-in surface types (React display · SVG diagram · review
HTML · data-heavy).

## Install just this skill

```bash
./install.sh auditor           # macOS / Linux / Git Bash
.\install.ps1 auditor          # Windows PowerShell
```

Self-contained — bundles its own spec lookup with a `--spec=<path>` argument for project
installs. Works without `installer` if you only run CI audits.

## Run it from the shell

```bash
node ~/.claude/skills/evidence-poet-auditor/audit.mjs <path> [options]
```

Options:

| Flag | Effect |
|---|---|
| `--spec=<path>` | path to `design.md` (default tries a relative location · external users pass explicit) |
| `--format=terminal\|json\|html` | output format (default: terminal) |
| `--surface=<name>` | force a profile (skip auto-detection): `react-display` · `svg-diagram` · `review-html` · `data-heavy` |
| `--auto-classify` | on unknown surface, content-sniff best match |
| `--strict-unknown` | on unknown surface, run Layer 1+2 strict, flag all extensions |
| `--dimensions=<id,...>` | run only specific dimensions |
| `--skip=<id,...>` | skip specific dimensions |
| `--define-profile=<name>` | interactive Q&A to create a new profile JSON |

## Trigger it as a Claude skill

```
audit this against EP spec
check for Evidence Poet drift
run EP auditor on <path>
verify <file> against Evidence Poet
/audit-ep
```

## What it catches (12 of 13 numbered dimensions implemented · #3c deferred)

| Layer | Dim | What it catches |
|---|---|---|
| **1 · Universal** | 1 hex-canonical · 3a spacing-scale · 4 font-family · 6 border-radius · 7 color-discipline · 8 motion-easing · 9 shadow | base rule violations |
| **2 · Surface-modulated** | 3b pair-rhythm · 5 type-role · 11 wcag-contrast | thresholds vary per profile |
| **3 · Surface-specific** | 10 cross-surface consistency · 12 extension governance | per-surface namespace + WCAG-comment rules |

## Exit codes (CI-friendly)

| Code | Meaning |
|---|---|
| 0 | pass (no P0/P1 · P2-only OK) |
| 1 | P1 violations only (CI · should-fix soft gate) |
| 2 | setup error (spec missing · bad args · walk failure) |
| 3 | P0 violations present (CI · must-fix hard gate) |

CI usage: gate on `>= 3` for strict (P0 blocks) · gate on `>= 1` for any-fail policy.

## What it does NOT do

- Does not auto-fix violations (`--fix` not implemented · roadmap)
- Does not enforce extensions beyond what the canonical spec authorizes (e.g., it doesn't
  check tag-orthogonality in review HTMLs — that's a builder-time concern)
- Does not run package managers · doesn't need npm

## Adding a new surface

Add a JSON to `surface-profiles/<name>.json`. No code changes. Or run
`--define-profile=<name>` for interactive Q&A.

## Files

- `SKILL.md` — Claude's manifest
- `audit.mjs` — CLI entry point
- `lib/` — color · profile · spec · walker · report + one module per dimension in
  `lib/dimensions/`
- `surface-profiles/*.json` — per-surface namespace + threshold + tag-orthogonality config
- `PLAN.md` — 10-phase roadmap · current scope · deferred work

## Where this fits

Lifecycle: install → build → **verify**. This is the verification stage — run after
constructing with `evidence-poet-builder` (or its specialists `evidence-poet-diagram` /
`evidence-poet-review`) before declaring the build done.
