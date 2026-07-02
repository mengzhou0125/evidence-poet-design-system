---
name: evidence-poet-auditor
description: Audit any EP (Evidence Poet / DNA1) design system artifact against the canonical spec. Use when the user says "audit this against EP spec" / "check for DNA1 drift" / "/audit-ep" / "run EP auditor" / mentions checking an artifact for design-system compliance. Covers 12 check dimensions across 3 layers (Universal · Surface-modulated · Surface-specific) with profile-based detection for 4 surface types (Display · Diagram · Review HTML · Data-heavy) + interactive --define-profile for new surface types. Output formats: terminal · JSON · HTML report. Subsumes sync-tokens.mjs via Dim #10 cross-surface check.
---

# evidence-poet-auditor

Self-contained CLI + Claude skill for auditing artifacts against the EP / DNA1 design system spec. 0 npm dependencies · pure Node.js stdlib.

## Trigger phrases

- "audit this against EP spec"
- "check for DNA1 drift"
- "/audit-ep"
- "run EP auditor on <path>"
- "verify <file> against DNA1"

## Dimensions implemented (12 of 13 numbered · only #3c deferred)

### Layer 1 · Universal (apply to all surfaces)

| # | Dimension | What it catches |
|---|---|---|
| 1 | Hex literal canonical | non-canonical hex / rgba values not in design.md §0 JSON |
| 3a | Spacing scale | padding/margin/gap values not on 4px-rooted scale |
| 4 | Font family | non-canonical fonts (only Playfair Display / Plus Jakarta Sans / DM Mono) |
| 6 | Border-radius | Guardrail A · must be 0 globally |
| 7 | Color discipline | Guardrail C · no gold-as-text · no sub-#717171 grays for body |
| 8 | Motion easing | Guardrail D · only canonical cubic-bezier(0.16, 1, 0.3, 1) |
| 9 | Shadow | hover/active state only · no decorative default shadows |

### Layer 2 · Surface-modulated (same check, thresholds vary per profile)

| # | Dimension | What it catches |
|---|---|---|
| 3b | Pair rhythm | same selector + property used with inconsistent gap values across file |
| 5 | Type role | Guardrail B · serif on heading / sans on body / mono on label only · reversed = P0 |
| 11 | WCAG contrast (static) | same-selector text/bg pair · resolves CSS vars · computes ratio · flags below 4.5:1 (3:1 large) |

### Layer 3 · Surface-specific (requires profile)

| # | Dimension | What it catches |
|---|---|---|
| 10 | Cross-surface consistency | scans known consumers (theme-dna1.css, svg-spec.md, review_html tokens.css) · canonical-token presence + reverse drift check · **subsumes sync-tokens.mjs** |
| 12 | Extension governance | per-surface namespace rules · WCAG comment requirement · 9-color tag orthogonality (review-html) |

### Genuinely deferred (with reasoning)

- **3c Density floor** — requires runtime: computed flex/grid layout · margin-collapse · em-relative units · `getBoundingClientRect`. Static approximations would be ~30% accurate = noise > signal. Would need puppeteer dep (violates 0-deps invariant) or static layout engine (massive). Defer until runtime infra justified by some other use.
- **Phase 8.5 nightly_audit.sh integration** — operational tooling · per user direction · defer.

## Surface profiles (4 known types)

Profile JSON files in `surface-profiles/` declare:
- `detect.filePattern` (glob) + `detect.contentSniff` (substrings)
- `extensions.allowedNamespaces` + `extensions.requireCommentPattern` + `extensions.tagOrthogonality`
- `thresholds.densityFloor` + `thresholds.rhythmStrict` (used by deferred Phase 5/3.5)

Built-in profiles:
- `react-display` — `.tsx`/`.jsx` React components
- `svg-diagram` — `.svg` standalone diagrams
- `review-html` — `_review/*.html` or `review_html/*.html`
- `data-heavy` — `prototypes/*.html` with table/sticky/status patterns

**Adding a new surface** = add a new JSON to `surface-profiles/`. No code changes.

## Usage

```bash
node ~/.claude/skills/evidence-poet-auditor/audit.mjs <path-to-audit> [options]
```

Options:
- `--spec=<path>` — design.md path (default tries `./.claude/design.md` in the current working directory · resolves automatically for a project-local install via `evidence-poet-installer` · otherwise pass an explicit path, e.g. `--spec=./design.md`)
- `--profiles=<dir>` — profile directory (default: bundled `surface-profiles/`)
- `--format=terminal|json|html` — output format (default: terminal)
- `--surface=<name>` — force a specific profile (skip detection)
- `--auto-classify` — on unknown surface, content-sniff best match
- `--strict-unknown` — on unknown surface, run Layer 1+2 strict, flag all extensions
- `--dimensions=<id,id,...>` — run only specific dimensions
- `--skip=<id,id,...>` — skip specific dimensions
- `--define-profile=<name>` — interactive Q&A to create a new `surface-profiles/<name>.json` (used when artifact doesn't fit any existing surface type)
- `--quiet` — silent on a clean pass (no output · exit 0). FAIL still prints. Used by the per-session self-check (see CLAUDE.md EPDS-DIRECTIVE §5) so the happy path is silent.
- `--fix` — **review-gate auto-fix · dry-run by default** (prints a diff, writes nothing). Only high-certainty drifts are auto-fixable: dim #01 hex within Δ≤2 of a canonical token, and dim #08 non-canonical easing. Structural / ambiguous findings (spacing, type-role, WCAG, cross-surface, non-canonical fonts) stay report-only.
- `--apply` — with `--fix`: actually write the proposed changes to disk. Intended flow: run `--fix` → review the dry-run diff → re-run with `--fix --apply`.

## Exit codes (refined 2026-05-26 per Layer 4 review · --fix added 2026-07-02)

- `0` — pass (no P0/P1 · P2-only OK) · also a successful `--fix` dry-run or apply
- `1` — P1 violations only (CI: should-fix · soft gate)
- `2` — setup error (spec missing, bad args, file walk fails) · also a `--fix` write failure
- `3` — P0 violations present (CI: must-fix · hard gate)

CI usage: gate on exit `>= 3` for strict (P0 blocks) · gate on exit `>= 1` for any-fail policy.

## Output examples

**Terminal**:
```
evidence-poet-auditor
spec:    /path/to/your/design.md
target:  /path/to/file.css
dimensions: 01-hex-canonical, 03a-spacing-scale, ...

path/to/file.css  · Review HTML (40%)
  P0 15:32 [01-hex-canonical] non-canonical hex literal · #7E6720
  P1 25:45 [03a-spacing-scale] non-canonical spacing value "6px" not on 4px scale
✗ FAIL · 2 violations across 1 files
```

**JSON** (`--format=json`): structured output for CI / tooling integration.

**HTML** (`--format=html`): renders report using the EP review HTML visual language (self-circular · auditor uses the system's own pattern).

## How invoked as Claude skill

When user invokes (via trigger phrases), Claude:
1. Identifies the target path from user message
2. Runs `node audit.mjs <path>` with default options
3. Reports violations grouped by file + severity
4. Offers to fix flagged drift. For high-certainty drifts (hex Δ≤2 · non-canonical easing), run `--fix` (dry-run) to show the exact diff, then — **after the user approves** — re-run with `--fix --apply` to write. Structural / ambiguous findings (spacing, type-role, WCAG, cross-surface, fonts) have no auto-fix; propose a manual edit for those.

### Per-session self-check (auto-trigger · added 2026-07-02)

Beyond explicit invocation, the installed CLAUDE.md **EPDS-DIRECTIVE §5** now instructs Claude to run this auditor on the frontend files it changed before declaring done — `node ~/.claude/skills/evidence-poet-auditor/audit.mjs <changed> --quiet`. `--quiet` makes the happy path silent (PASS → no output, just continue); only drift surfaces, at which point Claude offers the `--fix` review-gate above. This replaces the older "trace tokens by eye" self-check with a real tool call.

## Source vs deployed

- Public repo: `evidence-poet-design-system/evidence-poet-auditor/` (3rd top-level component · alongside installer + builder · per spec+distribution+verification triad)
- Deployed (local Claude install): `~/.claude/skills/evidence-poet-auditor/`
- Deploy: `cp -r` from public repo or your local skill-authoring folder

## See also

- `PLAN.md` — 10-phase roadmap · current scope · deferred work
- `surface-profiles/*.json` — extend by adding a new file
- `lib/dimensions/*.mjs` — one file per check dimension · extend by adding a new module + import in `audit.mjs`
