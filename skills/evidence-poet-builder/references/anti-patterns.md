# Evidence Poet Anti-Patterns

Read this before writing any code. The four guardrails are non-negotiable; the
user-strict rules are hard rules; the extension governance keeps the system coherent as
it grows. Most framework defaults (rounded corners, drop shadows, decorative icons)
violate Evidence Poet — you must override them explicitly.

---

## The four guardrails (from `spec.md` §9 · never bend)

### A · Visual DNA
- ✓ Sharp corners — `border-radius: 0` on every element, no exceptions. Precision over friendliness.
- ✓ Gold marks only worth-noticing nodes — scarcity is the signal.
- ✓ Shadows mark engagement — on hover, or as an explicit active/featured state. Never decorative.
- ✗ Decorative gradients · textures · patterns.

### B · Type language (each role in its own register)
- ✓ Serif (Playfair Display) → narrative authority — headings only.
- ✓ Sans (Plus Jakarta Sans) → readable body — paragraphs only.
- ✓ Mono (DM Mono) → precise annotation — labels · nav · CTA · tags only.
- ✗ Reversing roles — serif body, sans heading.

### C · Color discipline (WCAG-bound)
- ✓ All colors via design tokens.
- ✗ Gold (`#C8A84B`) as text — fails WCAG (2.14:1). Gold is for lines and accents only.
- ✗ Sub-`#717171` grays for body text — fails WCAG. `#717171` is the floor (4.55:1).

### D · Motion restraint (invited, never volunteered)
- ✓ Single easing — `cubic-bezier(0.16, 1, 0.3, 1)`.
- ✗ Bounce / elastic / overshoot.
- ✗ Auto-play without disclosure.
- ✗ Parallax · scroll choreography · staged delays.

---

## User-strict rules (hard rules · above and beyond the guardrails)

> **Source authority** (clarified 2026-05-26 per Layer 3 review §4 P1): each rule below is marked with its origin — `[builder-only · user preference]` (NOT in spec §9 · evidence-poet-auditor does NOT enforce) or `[mirrors spec §X]` (auditor enforces dim corresponding to spec rule).

### 1 · Zero emoji icons — anywhere  `[builder-only · user preference · NOT in spec §9]`

No emoji in any UI, artifact, file content, or status signal. Common offenders, all
banned: 🟢🟡🔴 ✅❌ ⚠ 🚦 🚩 🔥 🎯 ✨ 🚀 🤖 📌 📊 💡 🐛.

Replace with a CSS swatch + a text label:
```html
<span class="swatch swatch--green"></span> Green env
```
or a text pill: `<span class="env-pill env-pill--green">Green</span>`. The swatch is a
small solid block (e.g. 6×6px); the text carries the meaning.

### 2 · Zero rounded corners  `[mirrors spec §6 + §9-A]`

`border-radius: 0` globally. If a component framework defaults to rounded (MUI, Chakra,
shadcn defaults), override it explicitly with a global reset:
```css
*, *::before, *::after { border-radius: 0; }
```

### 3 · No decorative shadows  `[mirrors spec §6 + §7 + §9-A]`

Only `--shadow-hover: 0 2px 12px rgba(0, 0, 0, 0.06)` is canon. No drop-shadows beyond it,
no glow, no neumorphism. Default state is flat; depth appears on engagement (hover) or an
explicit featured state.

### 4 · No hardcoded values  `[mirrors spec §11 iteration rule #1]`

Never write a literal hex / px / font-family outside the token set. In CSS use
`var(--token)`; in vanilla / SVG use the `spec.md` §0 JSON values directly and
comment them as Evidence Poet tokens. Spacing comes only from the 4px-rooted scale.

### 5 · No gold overuse  `[mirrors spec §1 + §9-A]`

Gold `#C8A84B` is scarce — only where it earns the eye (an active state, a gold line
under a selected tab, a pause moment). Not for body text, not for large background
blocks, not for every button.

---

## Extension governance (adding non-canonical tokens)

Some builds genuinely need values the spec does not have — status colors for a data
dashboard, severity colors for a review tool. These are **extensions**. Five rules:

1. **Namespace prefix mandatory** — never collide with a base token. Use a clear prefix:
   `--review-*` · `--bright-*` · `--severity-*` · `--<consumer>-*`.
2. **WCAG rationale inline** — for any color used with or behind text, document the
   contrast ratio in a comment next to the token.
3. **Derivation explicit** — if an extension derives from a base token, state the lineage
   (`--color-accent-dark` derived from `--color-accent` for text-bearing use), don't
   paste a raw hex eyeballed from memory.
4. **Live with the consumer** — extension tokens belong in the consumer's own token file
   / `<style>` block, NOT in the canonical `spec.md` §0.
5. **Cross-consumer convergence triggers promotion** — if two or more builds independently
   invent the same semantic extension (e.g. a severity scale), that is a signal it should
   become canonical — propose adding it to the spec rather than re-inventing a third time.

**The anti-pattern this prevents — drift via approximation**: eyeballing a "close enough"
hex from memory, with no WCAG rationale and no lineage. A consumer that does this drifts
silently from the design language. Every value is either a canonical token or a governed,
namespaced, documented extension. There is no third category.

---

## Additional spec-derived rules (added 2026-05-26 per Layer 3 review §X1 propagation)

These rules exist in `spec.md` (the canonical spec) but were missing from this anti-patterns doc. Builder must teach them so artifacts pass auditor checks (auditor dims #3b / #3c / #5 / #11).

### 6 · Spacing pair rhythm  `[mirrors spec §5 "Pair rhythm" · auditor dim #3b]`

Within a single artifact, the same element-pair must use the same gap. If `.card-box → .card-box` is 16px in one place, every `.card-box → .card-box` should be 16px — not 16px in one section and 24px in another without justification. **Concretely**: when the same selector + same spacing property (`margin-bottom` / `padding-bottom` / `gap`) appears with multiple distinct values across one file, the minority value is drift unless explicitly justified (visual breakpoint · special section · documented inline). Scale adherence (rule 4) prevents off-scale values; rhythm consistency prevents on-scale values applied inconsistently.

### 7 · Density floors per surface type  `[mirrors spec §5 "Density floors" · auditor dim #3c deferred]`

Per-surface minimum gaps between adjacent elements:

| Surface | Min body-text gap | Min section gap |
|---|---|---|
| Display (React)    | 12px | 24px |
| Diagram (SVG)      | 8px (label-to-line) | 40px (node-to-node) |
| Review HTML        | 12px | 24px |
| Data-heavy         | 4px (table cell) | 24px (section to section) |

For builder: identify surface · pick floor value OR floor + 1 step on scale (e.g. floor 12 → pick 12 or 16, not 8) · use consistently per pair rhythm rule above.

### 8 · Motion duration scale  `[mirrors spec §0 durations + §7 Motion]`

5 named durations (verbatim from spec §0 JSON `durations`):
- `0.15s` — micro feedback (link color)
- `0.2s` — border / highlight switch
- `0.3s` — content fade-in on viewport entry
- `0.4s` — card hover (gold-left + shadow)
- `0.55s` — accordion structural change

Use named durations (CSS var `--duration-*` or named constants) · never literal `0.42s` or arbitrary milliseconds.

### 9 · Type role usage  `[mirrors spec §9-B Guardrail B + §3 Hierarchy · auditor dim #5]`

Beyond rule B (no role reversal at font-family level), use the right size + weight per role:
- Headings → Serif (Playfair Display) · 24-48px · weight 600-700
- Body → Sans (Plus Jakarta Sans) · 14-18px · weight 400
- Labels / nav / CTA / tags → Mono (DM Mono) · 12-13px · weight 400-500 · uppercase + tracking 0.03-0.08em
- See `spec.md` §3 Hierarchy table for canonical sizes + tracking + LH per role

### 10 · WCAG contrast  `[mirrors spec §2 + §9-C · auditor dim #11]`

Text-on-bg pairs must hit WCAG AA contrast: ≥ 4.5:1 (normal text) · ≥ 3:1 (large text ≥ 18.66px bold OR ≥ 24px). Verify text color + bg color combo (resolving CSS vars) before shipping. Floor: `#717171` body text on `#F8F7F3` paper = 4.55:1 (just clears AA). Anything lighter than `#717171` fails AA for body text.

### 10b · Cross-surface token sync  `[mirrors spec §"Sync rule" · auditor dim #10]`

If your build edits a `theme-evidence-poet.css`-equivalent token file OR adds a new consumer of design.md §0 tokens, **verify cross-surface sync** before declaring done. Spec §"Sync rule" lists 4 canonical token-holding consumers; new consumers should follow the same pattern (verbatim hex from §0 · WCAG comments · namespaced extensions).

**How to verify** (run from your project root that hosts the design.md source):
```bash
# (a) If your project has a sync-tokens-style script:
node scripts/sync-tokens.mjs

# (b) Preferred · auditor dim #10 subsumes sync-tokens · works without project-specific script:
node ~/.claude/skills/evidence-poet-auditor/audit.mjs <your-build-path>
```

Closes a previously-open PARTIAL gap (per Layer 4 §X3 cross-layer matrix) where builder didn't teach sync enforcement.

### 11 · Image standards  `[mirrors spec §8 · delegate to compress-images skill]`

- Width cap: 1920px · never wider
- Source scale: 2× from Figma (Retina-ready)
- Format: PNG + WebP sibling · served via `<picture>` first-source
- Loading: `loading="lazy"` for non-hero
- Vector: SVG · never raster for diagrams/frameworks

Image processing is delegated to `compress-images` skill · don't reinvent here.

---

## Quick self-check before declaring a build done

Updated 2026-05-26 to mirror auditor 12 dimensions (was 9 items · now 13). Items marked [auditor dim #N] are post-build verifiable via `evidence-poet-auditor` (run as Step 7 of builder workflow).

- [ ] Every corner sharp (`border-radius: 0`) — including framework-default components  `[dim #6]`
- [ ] Three fonts, roles not reversed (serif heading · sans body · mono label/tag)  `[dim #4 + #5]`
- [ ] Zero emoji — status signals use CSS swatch + text  `[builder-only · no dim]`
- [ ] Zero hardcoded hex/px/font outside tokens (or governed namespaced extensions)  `[dim #1 + #3a + #4]`
- [ ] Gold used only on accent lines / active states — never as text, never decorative  `[dim #7]`
- [ ] Shadows only on hover or explicit featured state — default state flat  `[dim #9]`
- [ ] Motion uses single easing curve + named duration — no bounce / parallax / silent autoplay  `[dim #8]`
- [ ] Body text grays at or above #717171 WCAG floor  `[dim #7 + #11]`
- [ ] Spacing on 4px-rooted scale  `[dim #3a]`
- [ ] Same element-pair uses same gap consistently across file  `[dim #3b]`
- [ ] Per-surface density floor honored (per surface type table above)  `[dim #3c deferred]`
- [ ] Text/bg contrast ≥ 4.5:1 normal · ≥ 3:1 large  `[dim #11]`
- [ ] Any extension token namespaced + WCAG-documented + derivation-explicit  `[dim #12]`

**After self-check passes → run `evidence-poet-auditor <path>` for post-build verification** (per Step 7 of builder workflow).

