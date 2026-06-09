# evidence-poet-review

The **content-review-HTML production engine** for the DNA1 ("Evidence Poet") design language.
When you need to turn a document, a spec, a code change, or a design proposal into a
**side-by-side review surface** — content on one side, AI rationale annotations on the other,
per-section feedback the reader can collect with one click — in DNA1, this skill gives you
the tokens, two layout archetypes, two tag profiles, DIFF mode for incremental re-reviews,
and a double-clickable example to copy from.

## Install just this skill

```bash
./install.sh review            # macOS / Linux / Git Bash
.\install.ps1 review           # Windows PowerShell
```

Self-contained — bundles its own DNA1 spec mirror. Works without `installer` if you're only
rendering review HTMLs.

## Trigger it

```
render this doc as a review HTML
build a DNA1 review HTML for [spec / case study / PR / blog draft]
用 DNA1 出 review · review 这篇 [文档名]
/review-dna1
```

## What it does

1. Reads the spec + review-extension tokens + the CJK font-stack discipline
2. Asks **one bootstrap question** (what + how long) and infers:
   - **Layout archetype** A (right-rail · sticky annotation rail beside content) vs B
     (stacked · annotations inline under content)
   - **Tag profile** A (editorial · 3 status × 4 layer) vs B (technical · 3 axes × 3
     variants = 9 colors)
   - **Review roles** to apply (Layer 0 baseline always on + Layer 1+ role-specific lenses
     like cold-scan reader, spec-rootedness auditor, etc.)
3. Generates a single `.html` file with:
   - `<html lang="zh-Hans-CN">` + YaHei-first font stacks (Windows Han-unified discipline)
   - Left ToC + per-section content + annotations + per-section `.user-feedback` block
   - A fixed "📋 Copy all feedback" button — serializes every feedback block to clipboard
     on demand · the page saves no data
4. For re-reviews: applies **DIFF mode** (section-level state tags · changed-section gold
   tint + changebar · unchanged-section fold + dim · rail-trim)
5. Hands off to `evidence-poet-auditor --surface=review-html` for verification

## What it does NOT do

- Does not edit the source document being reviewed (the rail proposes; the human decides;
  the edit is a separate step)
- Does not save user feedback (the page is ephemeral — collector serializes to clipboard on
  demand)
- Does not install the spec → `evidence-poet-installer`
- Does not audit its own output → `evidence-poet-auditor --surface=review-html`

## Files

- `SKILL.md` — Claude's manifest
- `references/dna1-spec.md` — canonical token spec (bundled mirror)
- `references/tokens.css` — base + review-extension CSS variables (incl. YaHei-first stacks)
- `references/components.css` — all CSS rules (both layout archetypes, tag styles, audit-box,
  user-feedback, summary-block)
- `references/feedback-collector.js` — self-contained IIFE · adds the "Copy all feedback" button
- `references/example.html` — double-clickable demo of both archetypes
- `references/tag-profiles.md` — Profile A editorial vs Profile B technical (CSS classes +
  WCAG rationales)
- `references/review-roles.md` — Layer 0 baseline + Layer 1+ role taxonomy
- `references/diff-mode.md` — incremental re-review mode

## Where this fits

Lifecycle: install → build → verify. This sits on a different axis — it's the
**depth-specialist for one surface (content-review HTML)**, parallel to `evidence-poet-diagram`
for SVG diagrams. `evidence-poet-builder` Scenario D defers content-review HTML here.
