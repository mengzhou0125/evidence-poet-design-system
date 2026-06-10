# DNA1 — The Evidence Poet

> **DNA1 — a portable design system spec.** Framework-agnostic · AI-readable · machine-checkable.
> Use as prompt context when generating components, assets, or layouts in this brand.
> (Originally authored for `mengz.space` · now released as a reusable spec under MIT License.)
>
> Tone: Academic journal × architecture magazine. Mono labels for information order,
> serif headlines for narrative weight, gold lines for moments worth pausing.
> Restrained, rational, but never cold.

> **Naming convention** (clarification added 2026-06-09 after 3-repo split):
> - **DNA1** = the codename / versioned identifier for this spec (DNA2 etc. would be future evolutions)
> - **Evidence Poet** / **EPDS** = the brand name and public-facing identity
> Both refer to the same spec. DNA1 stays as the internal/historical codename in this canonical file; the public surface (GitHub repos · skills · external READMEs) emphasizes "Evidence Poet" / "EPDS". Either name is correct in context.

---

## 0. Token Source (machine-readable)

> Source-of-truth tokens. A sync script reads this JSON and propagates values to all downstream consumer files (theme CSS · generator specs · review tools · etc.).
> Edit values here · run your project's sync mechanism (e.g. `npm run sync:tokens` for Node projects) · downstream consumers verified automatically.

```json
{
  "color": {
    "warmPaper": "#F8F7F3",
    "inkBlack": "#1A1A18",
    "archiveGold": "#C8A84B",
    "coolBlueGray": "#527590",
    "focusRing": "#527590",
    "warmBorder": "#EDE9E2",
    "cardBg": "#FFFFFF",
    "graySubtitle": "#555555",
    "grayCaption": "#666666",
    "grayLabel": "#717171",
    "grayLargeOnly": "#888888",
    "placeholderBg": "#D8D5D0",
    "surface": "#f5f5f3",
    "surfaceHover": "#eeedea",
    "progressActiveBg": "#faf6ee",
    "progressFill": "rgba(200, 168, 75, 0.12)",
    "progressFillLight": "rgba(200, 168, 75, 0.08)",
    "activeBorder": "rgba(200, 168, 75, 0.25)"
  },
  "font": {
    "serif": "Playfair Display",
    "sans": "Plus Jakarta Sans",
    "mono": "DM Mono"
  },
  "spacing": [4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 120],
  "easing": "cubic-bezier(0.16, 1, 0.3, 1)",
  "durations": {
    "micro": 0.15,
    "highlight": 0.2,
    "fade": 0.3,
    "cardHover": 0.4,
    "accordion": 0.55
  },
  "borderRadius": 0,
  "borderWidth": 1,
  "accentLineWidth": 3,
  "shadowHover": "0 2px 12px rgba(0, 0, 0, 0.06)",
  "imageMaxWidth": 1920,
  "promotedExtensions": {
    "accentDark": "#7E6720",
    "reviewDelFill": "#A85F4D",
    "reviewDelTint": "#F3EAE7",
    "reviewKeptTint": "#F8F2E0",
    "reviewLayerForest": "#5A7A5A",
    "reviewLayerOlive": "#5E5840",
    "reviewLayerTeal": "#4E7A85",
    "auditSeverityLow": "#5A8A5A"
  }
}
```

The human-readable tables in §2 / §3 / §5 / §6 derive from this block. JSON is canonical when in conflict.

**Schema notes** (added 2026-05-26 per spec review):
- `focusRing` and `coolBlueGray` share the same hex `#527590` — `focusRing` is a **semantic alias** (focus-ring use case) of the same color. JSON has no var refs · the duplication is intentional.
- `shadowHover` is a **composite CSS value** (offset + blur + color) packed as a single string · downstream consumers parse it as `box-shadow` shorthand. Other fields are single primitives.
- `durations` (added 2026-05-26) — named timing values used by §7 motion duration scale · machine-readable for sync-tokens.mjs verification.
- rgba values use **spaces after commas** consistently (e.g. `rgba(200, 168, 75, 0.12)`) — matches CSS Working Draft convention.

---

## 1. Visual Theme & Atmosphere

The Evidence Poet carries a core tension: "Evidence" (behavioral science,
data-backed, hypothesis-verified) × "Poet" (warm narrative, human understanding,
restrained depth). A person who writes poetry with evidence.

Three key moves define the system (canonical definitions in §3 Typography · §6 Geometry · §9 Guardrails):

- **Three-font tension** — serif narrative, sans body, mono annotation · each role kept in its own register (see §3 / §9-B)
- **Sharp corners globally** — `border-radius: 0` · precision over friendliness (see §6 / §9-A)
- **Gold reserved for "worth-noticing" nodes** — used sparingly, as signal rather than decoration (see §9-A)

Atmospheric notes (visual derived properties):
- Warm paper white (`#F8F7F3`) — archival warmth, not screen-cold
- Hover-only shadows — restrained confidence, responds when engaged
- Single easing curve — fast in, slow out (canonical value in §0 · semantics in §7)
- Motion exists only when invited (**disclosed exceptions exist** · see §7 Motion · Featured-state + Auto-play sections · 3 named exceptions)

---

## 2. Color Palette & Roles

### Primary
| Name            | Hex       | Role                              | Constraint               |
|-----------------|-----------|-----------------------------------|--------------------------|
| Warm Paper      | #F8F7F3   | Page background                   | —                        |
| Ink Black       | #1A1A18   | Headings, primary text            | —                        |
| Archive Gold    | #C8A84B   | Accent — borders, lines, icons    | NOT for text (2.14:1)    |
| Cool Blue-Gray  | #527590   | CTA link text                     | —                        |
| Focus Ring      | #527590   | :focus-visible outline (alias of Cool Blue-Gray) | 4.6:1 vs #F8F7F3 |
| Warm Border     | #EDE9E2   | Dividers, card borders            | —                        |

### Text Gray Scale (background #F8F7F3)
| Hex     | Ratio  | Role                          | Floor for body text |
|---------|--------|-------------------------------|---------------------|
| #555    | 6.95:1 | Subtitles, descriptions       | ✓                   |
| #666    | 5.36:1 | Captions, card labels         | ✓                   |
| #717171 | 4.55:1 | Section labels, nav links     | ✓ (the floor)       |
| #888    | 3.31:1 | Large text only (≥18px)       | ✗                   |

> **Surface caveat**: ratios above assume #F8F7F3 paper background. On Surface (#f5f5f3 · button/tag BG), #717171 drops to ~4.4:1 — just under the floor. For text on Surface, use #666 or darker.

### Surface & State
| Token               | Value                              | Role                              |
|---------------------|------------------------------------|-----------------------------------|
| Card BG             | #FFFFFF                            | Card surface                      |
| Surface             | #f5f5f3                            | Button BG, tag BG                 |
| Surface hover       | #eeedea                            | Button hover BG                   |
| Placeholder BG      | #D8D5D0                            | Image/carousel placeholders       |
| Progress fill       | rgba(200, 168, 75, 0.12)           | Progress bar fill                 |
| Progress fill light | rgba(200, 168, 75, 0.08)           | Progress bar fill (light variant) |
| Active item BG      | #faf6ee                            | Active carousel item bg           |
| Active border       | rgba(200, 168, 75, 0.25)           | Active carousel border            |
| Hover shadow        | 0 2px 12px rgba(0, 0, 0, 0.06)     | Hover state only                  |

---

## 3. Typography Rules

### Font Stack
| Role   | Font                | Use                 |
|--------|---------------------|---------------------|
| Serif  | Playfair Display    | Headings (h1–h4)    |
| Sans   | Plus Jakarta Sans   | Body text           |
| Mono   | DM Mono             | Labels, nav, CTA    |

### Hierarchy
| Role            | Font   | Size | Weight | LH   | Tracking | Canonical use (full mapping in `react-bindings.md`) |
|-----------------|--------|------|--------|------|----------|-----------------------------------------------------|
| Display Hero    | Serif  | 48px | 700    | 1.15 | -0.02em  | Home hero h1                                        |
| CS Hero         | Serif  | 42px | 700    | 1.2  | -0.02em  | Case study h1                                       |
| Section Title L | Serif  | 32px | 700    | 1.2  | -0.02em  | Module h2                                           |
| Section Title M | Serif  | 28px | 700    | 1.3  | —        | Case study section title · About h2                 |
| Section Title S | Serif  | 24px | 600    | —    | —        | Module h3                                           |
| Hero Subtitle   | Sans   | 18px | 400    | 1.7  | —        | Hero subtitle                                       |
| Body Primary    | Sans   | 16px | 400    | 1.8  | —        | Case study body                                     |
| Body Secondary  | Sans   | 15px | 400    | 1.8  | —        | Card description                                    |
| Body Tertiary   | Sans   | 14px | 400    | 1.6  | —        | Caption body · disclaimer · about-method body       |
| Label M         | Mono   | 13px | 400    | —    | 0.03em   | uppercase · section labels · nav · CTA              |
| Label S         | Mono   | 12px | 400    | —    | 0.06em   | uppercase · hero label · sticky nav                 |
| Tag             | Mono   | 12px | 400    | —    | —        | regular case · skill tags                           |

> **Note**: full component-level use-case mapping (which BEM class uses which role) lives in [`react-bindings.md`](./react-bindings.md) · this table keeps only canonical primary use per role to stay scannable. Tracking column resolved per §3 Principles (≥32px → -0.02em).

### Principles
- Headings tight (LH 1.15–1.3), body relaxed (LH 1.6–1.8) — information density rhythm
- Tighten tracking at ≥32px (-0.02em) — prevents visual looseness on large display
- Widen tracking on uppercase labels (0.03–0.08em) — increases legibility, signals "annotation"
- Only 4 weights: 400 (body / labels), 500 (CTA), 600 (subtitles), 700 (titles)
- **Serif numerals at ≥24px with mixed glyphs → `font-variant-numeric: lining-nums tabular-nums`** — Playfair Display defaults to oldstyle figures (4/3/5/7/9 have descenders below baseline) which clash with adjacent letters/symbols (`$170M+`, `4M+`). Lining figures sit on baseline at cap-height; tabular figures align column widths across multiple values. Apply to any serif-rendered data point (metric tile, summary count, etc.) that mixes digits with letters or symbols. Lowercase letters (`pp`, `px`) keep their natural x-height + descenders — that is correct typography, not a bug.

### CJK / i18n font fallback (mandatory for CJK-bearing surfaces)
The spec names 3 **Latin** fonts (above). Any token-bearing element that may render **CJK** text MUST build its CSS stack with a **script-appropriate CJK font first** among the fallbacks — Simplified-Chinese example: sans/mono → `'Microsoft YaHei', 'PingFang SC', 'Source Han Sans SC'`; serif → `'Source Han Serif SC', 'Noto Serif SC'`. **Why**: with no CJK font ahead of the generic family, Windows falls back to its OS Han-unified default and renders **Traditional** glyphs (wrong for Simplified content). This applies to **mono and serif too** — a surface whose labels/tags can be Chinese (e.g. the review-HTML surface, whose status/layer tags `改`/`删`/`D 精简` render in *mono*) must carry the CJK fallback in its *mono* stack, not only the body sans. The spec defines font **names**; consumers build the **stack**, but this fallback-ordering rule is mandatory, not optional. (Verified by the `evidence-poet-auditor` CJK-fallback check on CJK-bearing surface profiles.)

### Universal Label rule (Label M)
Label M: 13px DM Mono · weight 400 · uppercase · letter-spacing 0.03em · color #717171.
Semantically a label (not a heading) — paragraph element, not h2/h4.

**Label M vs Label S boundary** (judgment criterion):
- Use **Label S** (12px · 0.06em) when: container width &lt; ~30 chars of label text · OR vertical space &lt; 32px · OR context is hero / card meta / sticky nav (where Label M would crowd).
- Use **Label M** (13px · 0.03em) elsewhere — section labels, nav links, CTA, footer.

---

## 4. Component Patterns

### Project Card
- BG #FFFFFF · 1px border #EDE9E2 · radius 0
- Hover: 3px gold left border + hover shadow
- Company tag: Label S (Mono 12px uppercase · 0.06em · #717171)
- Title: Serif 20px · weight 600
- Description: Sans 15px · #555
- Tags: Mono 12px (Tag · regular case) · #666 · BG #f5f5f3 · padding 2px 8px
- CTA: Mono 13px · weight 500 · color #527590 · arrow suffix

### Sticky-Scroll Item
- Layout: 5/12 text col + 7/12 image col · top-aligned · gap 64px desktop / 40px mobile
- Text col: label (Mono 13px) + title (Serif 24–32px) + body (Sans 14px) + impact line
- Image col: image + caption (Style A or B below)

### Caption System
- **Style A** (split-at-colon): caption-title (Serif 16px weight 600) + body (Sans 14px #666)
- **Style B** (single paragraph): Sans 14px #666 — when no internal split exists

### Before/After Slider
- Sharp-cornered viewport · 2px gold center handle · 28×28 visible knob (44×44 hit area on mobile · see §10) · ⇄ glyph
- Before/After labels: Label M (Mono 13px uppercase) · top-left + top-right · paper background

### Metrics Highlight
- 1- or 2-column grid · sharp borders between cells
- Value: Serif 36px weight 700 · ink black · **`font-variant-numeric: lining-nums tabular-nums`** (per §Principles · prevents Playfair oldstyle figure descenders clashing with adjacent letters/symbols in mixed-glyph values)
- Label: Sans 13px · #666

### Accordion Carousel
- Active panel widens (width-only animation · bookmark reveal)
- Inactive panels narrow to a window of the underlying image (no scaling)
- Easing 0.55s cubic-bezier(0.16, 1, 0.3, 1)
- Active BG #faf6ee · border rgba(200,168,75,0.25)

### Link Patterns

Three link styles, role-driven — never reverse:

| Pattern | Use | Color | Underline | Font |
|---|---|---|---|---|
| **Card CTA** | "View case study →" · arrow-suffixed action on a card | #527590 (cool blue-gray) | no | Mono 13px weight 500 |
| **Body inline** | links inside paragraphs (case study body · blog body · fallback messages) | #527590 | yes (text-underline-offset 2px) | Sans · inherits body size |
| **Structural nav** | top nav · section anchor nav · footer | #717171 (text-muted) | no (gold underline on active for section nav) | Mono |

Rules:
- ✗ Archive Gold (#C8A84B) as link color — fails WCAG (Guardrail C)
- ✗ Ink black (#1A1A18) as link color — visually invisible against body text
- ✓ Card CTAs read as "navigation affordance" — underline would feel button-like (wrong); the arrow suffix carries the signal
- ✓ Body inline links read as "follow this thread" — underline is the standard signal; preserve it
- ✓ Structural nav uses neutral gray; activation/hover comes from the gold underline (section nav) or color shift to ink black (top nav)

### Universal element rules

See canonical definitions (intentionally not redeclared here · single-source-of-truth):
- **Border-radius**: §6 Geometry · §9-A Guardrail
- **Shadow** (hover-only · default flat): §6 Geometry · §7 Motion · §9-A Guardrail
- **Transition + easing**: §0 JSON (`easing` + `durations`) · §7 Motion · §9-D Guardrail

---

## 5. Layout Principles

### Spacing Scale (4px base · all values in px)
4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64 / 80 / 120

The scale breathes from element-cluster (8–24px) to page-break (80–120px).
No arbitrary values — every margin/padding draws from the scale.

**Sub-scale exception** (tight badges only): 1–2px allowed inside small chip / tag / badge components where 4px feels too loose (e.g. §4 Project Card Tags padding `2px 8px`). Document inline in the consumer's CSS with comment `/* sub-scale: tight badge */`. Outside chip/tag contexts, stick to the scale.

### Pair rhythm (within-file consistency)

The scale gives *which* values to use. Pair rhythm governs *consistency in their use*:

**Rule**: within a single artifact, the same element-pair must use the same gap. If `.card-box → .card-box` is 16px in one place, every `.card-box → .card-box` should be 16px — not 16px in one section and 24px in another without justification.

Concretely: when the same selector + same spacing property (`margin-bottom` / `padding-bottom` / `gap`) appears with multiple distinct values across one file, the minority value is drift unless explicitly justified (e.g., visual breakpoint, special section, documented inline).

**Why it matters**: scale adherence (above) prevents off-scale values. Rhythm consistency prevents on-scale values applied inconsistently. The latter is more common drift because it passes scale-check while still reading as visually jittery.

**Examples**:
- ✓ all card-grid `gap: 24px` across all instances
- ✓ all section h2 `margin-bottom: 16px` across all sections
- ✗ mid-page section gap 32px · footer section gap 40px (no breakpoint/state difference)
- ✗ `.project-card__label { margin-bottom: 8px }` in one component · `.cs-hero__label { margin-bottom: 12px }` in another — different BEM-modifier scopes but same semantic element-pair (label-to-content gap) should align unless visually justified

Auditor enforcement: `evidence-poet-auditor` dim #3b flags minority pair-values with the majority value as suggestion.

### Density floors (per surface type)

The scale prevents off-scale; rhythm prevents inconsistent on-scale. **Density floors** prevent everything-on-scale-but-still-crowded — when an artifact uses only 4px/8px and renders as visually suffocating.

**Per-surface minimums** (rendered gap between adjacent elements):

| Surface type | Min body-text gap | Min section gap | Notes |
|---|---|---|---|
| Display (React) | 12px | 24px | dense ok; sticky scroll patterns may compress |
| Diagram (SVG)   | 8px (label-to-line) | 40px (node-to-node) | sparse required; nodes need breathing |
| Review HTML     | 12px | 24px (section-pair to section-pair) | medium density; reading-oriented |
| Data-heavy      | 4px (table cell) | 24px (section to section) | dense ok inside tables; sparse between sections |

**Derivation rationale** (where the per-surface numbers come from):
- **Body-text gap floor (12px)** ≈ body font-size (15px) × line-height (1.7) × 0.5 ≈ 12.75px · rounded down to scale value. This is "half-leading" breathing — minimum vertical gap that doesn't visually merge two paragraphs.
- **Section gap floor (24px)** = 2× body-text gap · gives clear hierarchical break without page-break feel.
- **Diagram node-to-node (40px)** = ~3× body-text gap · diagrams need extra breathing because labels often have multi-line text.
- **Data-heavy table-cell (4px)** = scale minimum · table density allows tight cells; section breaks still use 24px.

**Auditor enforcement**: planned in `evidence-poet-auditor` dim #3c · currently deferred (requires runtime layout measurement · headless browser dep). Until then: builder skill enforces at create-time + visual reviewers spot-check at PR.

**For builder skill** — when generating a new artifact:
1. Identify the surface type (per table above)
2. For each element pair (body→body, section→section), **pick the floor value OR floor + 1 step** on the spacing scale (e.g. floor 12px → pick 12 or 16, not 8). Floor + 1 step gives margin of error.
3. Use the chosen value **consistently** across all instances of that pair in the artifact (per pair rhythm rule above)

### Layout
- Container max: 1280px (1440px wide variant for image showcase)
- Container padding: 48px desktop · 24px tablet/mobile
- Content column: 720px max (640px narrow variant)
- Grid: 12 columns · 24px gap
- Common case-study split: text col 1/6 + image col 7/-1 (5 + 1 gap + 6) · top-aligned

### Breakpoints
| Name    | Range      | Strategy                          |
|---------|------------|-----------------------------------|
| Mobile  | < 640px    | Single column, reduced headings   |
| Tablet  | 640–1024px | Flexible, 24px container padding  |
| Desktop | > 1024px   | Default target, 48px padding      |

---

## 6. Geometry & Shape

- Border-radius: **0 globally** — every element, no exceptions
- Dividers: 1px solid #EDE9E2
- Gold accent line: 3px solid #C8A84B (hero subtitle, card hover, key-decision marks)
- Shadow: hover-only · 0 2px 12px rgba(0, 0, 0, 0.06)

> **Easing belongs to motion** · canonical value in §0 JSON · semantics in §7 · normative rule in §9-D. Removed from this geometry chapter as it was misplaced (motion ≠ geometry).

---

## 7. Motion & Interaction

- **State changes over displacement** — feedback via color, border, shadow; not transform/translate
- **Hover-only shadow** — default state is flat; depth appears on engagement
- **Bookmark-reveal accordion** — active panel widens; inactive narrows to a vertical window of the underlying image. A bookmark being slid open in an archive — width-only, no scaling, no perspective.
- **Single easing** — cubic-bezier(0.16, 1, 0.3, 1) for all transitions
- **Duration scale**:
  - 0.15s — micro feedback (link color)
  - 0.2s — border / highlight switch
  - 0.3s — content fade-in on viewport entry
  - 0.4s — card hover (gold-left + shadow)
  - 0.55s — accordion structural change
- **Auto-play exception**: autoplay carousels exist, but progress is disclosed via gold bar.
  No silent animation, ever.

### Analytics

> **Out of scope** for design system spec. Analytics wiring (hostname-gating · SPA route-change tracking · event firing) is a runtime / deploy concern · document it in your project's deployment runbook, not in the design system spec.

### Featured-state shadow exceptions

Shadow may persist (no hover required) when the element is in an explicit "featured/active" state — system signaling rather than user response:

- Active item in `ButtonProgressCarousel` (autoplay engagement)
- `.projects-grid__notice` (in-development banner · attention signal)

Rule: sparing · only when the element communicates "look at me now" via system state. Default state for ordinary content remains flat (Guardrail A).

---

## 8. Image Standards

- Width cap: 1920px — anything wider is wasted bandwidth
- Source scale: 2× from Figma (Retina-ready)
- Format: PNG (lossless-optimized) + WebP (q=85) sibling, served via `<picture>` first-source
- Loading: `loading="lazy"` default for non-hero images
- Vector content (frameworks, diagrams): SVG, never raster

---

## 9. Brand Guardrails

### A · Visual DNA (never bend)
- ✓ Sharp corners — precision over friendliness
- ✓ Gold marks only worth-noticing nodes — scarcity is the signal
- ✓ Shadows mark engagement — on hover or as an active/featured state · never decorative
- ✗ Decorative gradients · textures · patterns
- **rgba alpha overlays** (e.g. `rgba(200, 168, 75, 0.12)` for progress fill, `rgba(200, 168, 75, 0.25)` for active border) are **functional state signaling**, NOT decorative — exempt from the "no gradients/patterns" rule. They carry meaning (state/progress/active) not aesthetic decoration.

### B · Type Language (each role in its own register)
- ✓ Serif → narrative authority (headings only)
- ✓ Sans → readable body (paragraphs only)
- ✓ Mono → precise annotation (labels · nav · CTA · tags only)
- ✗ Reversing roles (serif body · sans heading)

### C · Color Discipline (WCAG-bound)
- ✓ All colors via design tokens
- ✗ Gold (#C8A84B) as text — fails WCAG (2.14:1)
- ✗ Sub-#717171 grays for body text — fails WCAG (3.31:1)

### D · Motion Restraint (invited, never volunteered)
- ✓ Single easing — cubic-bezier(0.16, 1, 0.3, 1)
- ✗ Bounce / elastic / overshoot
- ✗ Auto-play without disclosure
- ✗ Parallax · scroll choreography · staged delays

---

## 10. Responsive Behavior

| Element                                | Desktop    | ≤1024px                          | ≤640px                           |
|----------------------------------------|------------|----------------------------------|----------------------------------|
| Hero h1                                | 48px       | —                                | 32px                             |
| Hero subtitle                          | 18px       | —                                | 16px                             |
| CS h1                                  | 42px       | 28px                             | —                                |
| CS section title                       | 28px       | 24px                             | —                                |
| Container pad                          | 48px       | 24px                             | 24px                             |
| Sticky-scroll gap                      | 64px       | 40px                             | 40px                             |
| Grid (`.grid-12` container)            | 12 cols    | 12 cols (children collapse)      | 12 cols (children collapse)      |
| Pre-defined col spans (`.col-narrow` / `.col-text` / `.col-image`) | grid-column 1/9 · 1/7 · 7/-1 (8/6/6 col spans) | collapse to `1/-1` (full-width) | collapse to `1/-1` |
| Component grids (`.projects-grid` · `.contact-grid` · `.card-carousel`) | typically `1fr 1fr` (2-col) | `1fr 1fr` mostly | `1fr` (single col) |

> **Grid behavior**: the 12-column grid container stays 12 cols at all breakpoints · pre-defined `.col-*` span classes collapse children to full-width below 1024px. Component-internal grids (project cards · contact · carousels) have their own collapse rules (typically 2→1 at 640px). Verify against your project's `layout.css` (this DNA1 reference assumes that convention).

Touch targets: 44×44px minimum on mobile. Visually smaller controls (e.g., Before/After 28×28 knob) extend hit area via transparent padding to meet this floor.
Layout collapses to single column below 640px.

---

## 11. Agent Prompt Guide

### Quick reference

```
Background:    #F8F7F3    CTA text:      #527590
Ink Black:     #1A1A18    Subtitle:      #555
Gold accent:   #C8A84B    Caption:       #666
Border:        #EDE9E2    Label:         #717171
Card BG:       #FFFFFF    Surface:       #f5f5f3
Surface hover: #eeedea    Active item BG:#faf6ee
```

### Fonts

```
Headings: Playfair Display, 700, serif
Body:     Plus Jakarta Sans, 400, sans-serif
Labels:   DM Mono, 400, monospace
```

### Iteration rules for AI agents
1. Look up values via file-read of §0 JSON / §2 / §3 / §11 quick reference — cite the source section in rationale · never recall hex from training data
2. New components: sharp corners · gold hover-left-border · mono labels · serif titles
3. Honor the four guardrails (A/B/C/D) — they are non-negotiable
4. Spacing: pull only from the 4px-rooted scale (§5)
5. Motion: single easing curve; default state is flat; shadow on hover only

---

## Maintenance

This file is the **canonical token source** for the DNA1 design language.
All downstream consumers (theme CSS files · framework-specific implementations · generator specs · status/signal UIs) must reference these values · never redeclare them. When drift is detected, this file wins.

For workspace-specific consumer list + sync workflow, see internal-only section below (stripped from public installer mirror).


---

## Extension governance · how to add non-canonical tokens

> Added 2026-05-16 after `visual_review_html` BP promotion surfaced the need for explicit rules.

DNA1 base tokens (§0 JSON) cover the visual language baseline. Specific consumers (review HTML · data-dense tools · status/signal UIs) need additional tokens not in the base set (severity colors · env signals · review-semantic labels · etc.). These are **extensions** · the discipline:

**5 rules for adding extension tokens** (any consumer):

1. **Namespace prefix is mandatory** — never collide with base. Use `--review-*` (review HTML) · `--bright-*` / `--tint-*` / `--ink-*` (env signals in pipeline tools) · `--severity-*` (cross-consumer severity) · `--<consumer>-*` for consumer-specific extensions.
2. **WCAG rationale inline** — for any color used with text on it · document contrast ratio. Example: `--color-accent-dark: #7E6720; /* derived darker gold · WCAG-AA pass (5.5:1 white-on-this) · for text-bearing gold */`.
3. **Derivation explicit** — if extension derives from a base token (darken/lighten/alpha), state the lineage. Example: `--review-改-fill: var(--color-accent-dark);` not a raw hex.
4. **Live with the consumer** — extension tokens go in the consumer's tokens file (e.g., `visual_review_html/tokens.css`), NOT in this `design.md` §0 JSON. §0 stays the baseline-only canonical.
5. **Cross-consumer convergence triggers promotion** — if multiple consumers invent the same semantic extension, candidate to promote to design.md as a `§"Status / Signal extension"` sub-section (not §0 base · base stays narrow).

   **Promotion criteria** (different for token vs pattern):
   - **Token rule** (e.g. `--severity-high: #X` value): require ≥2 consumers using the same hex for the same semantic role. "Convergence" = same value + same use case, not just similar names.
   - **Pattern rule** (e.g. "9-color orthogonal tag system" structure): require ≥2 consumers using the same structural pattern (axes, cardinality, semantic mapping). Pattern promotion is rarer than token promotion.

   **Current status** (2026-05-26): 0 cross-consumer convergence promoted. `--severity-*` lives in `visual_review_html/tokens.css` only. `--color-accent-dark #7E6720` is a **candidate** for promotion (used in `visual_review_html/tokens.css` + `evidence-poet-builder` skill scenario D · per Layer 2 BP Review §X2).

**Anti-pattern · drift via approximation**: when adding a new consumer, NEVER eyeball hex values from memory. Copy verbatim from §0 JSON OR import `theme-dna1.css` / `visual_review_html/tokens.css`. Drift caught 2026-05-15 (my own review_html_workflow CSS skeleton drifted on `bg` / `gold` / `border` / `muted` / `dim` · all approximate · 0 WCAG rationale) · root cause was eyeballing. Fixed by 2026-05-16 promotion (BP doc canonical · sync-tokens.mjs §9 audit guard).

---

## Status / Signal extension (promoted from BP)

> Added 2026-05-26 per Layer 2 BP Review §X2 — promoted extensions that meet §"Extension governance" rule 5 cross-consumer convergence criteria (≥2 consumers using same hex for same semantic role).

### Promoted tokens

| Token | Value | Role | Consumers (≥2 confirmed) |
|---|---|---|---|
| `accentDark` | `#7E6720` | Text-bearing darker gold · WCAG-AA pass (5.5:1 white-on-this) — for status fills · text-bearing accent | `visual_review_html/tokens.css` (`--color-accent-dark`) + `evidence-poet-builder` skill scenario D references it |
| `reviewDelFill` | `#A85F4D` | "delete/remove" status fill · terracotta · WCAG 4.8:1 white-on-this | `visual_review_html/tokens.css` (`--review-del-fill`) + EPDS repo-validation re-derivation (2026-06-04) |
| `reviewDelTint` | `#F3EAE7` | light coral tint · safe for body text (WCAG 11.4:1 ink-on-this) | same |
| `reviewKeptTint` | `#F8F2E0` | light gold tint · safe for body text (WCAG 11.8:1 ink-on-this) | `visual_review_html/tokens.css` (`--review-改-light`) + re-derivation |
| `reviewLayerForest` | `#5A7A5A` | review layer · forest green · WCAG 4.7:1 white-on-this | `visual_review_html/tokens.css` (`--review-tech-layer-a`) + re-derivation |
| `reviewLayerOlive` | `#5E5840` | review layer · warm olive · WCAG (white-on) | `visual_review_html/tokens.css` (`--review-layer-b`) + re-derivation |
| `reviewLayerTeal` | `#4E7A85` | review layer · slate teal · WCAG 4.8:1 white-on-this | `visual_review_html/tokens.css` (`--review-tech-layer-c`) + re-derivation |
| `auditSeverityLow` | `#5A8A5A` | audit-box informational severity · sage green · WCAG 4.6:1 white-on-this | `visual_review_html/tokens.css` (`--audit-severity-low`) + re-derivation |

> **Convergence evidence**: two independent consumers produced the **identical** 7 hexes above for the **same** review-callout roles — a separate review-HTML implementation, and an AI rebuilding from the spec only (zero prior context) that **re-derived** them from the base palette + extension rules. That clears §"Extension governance" rule 5 ("≥2 consumers · same value · same use case"). They are folded into `§0 JSON promotedExtensions` so `evidence-poet-auditor` dim #01 recognizes them as canonical.

### Candidate (NOT yet promoted · only 1 consumer · monitor for 2nd convergence)

| Token | Value | Role | Status |
|---|---|---|---|
| `auditSeverityHigh/Mid` | varies | Audit-box higher-severity steps | only in `visual_review_html/tokens.css` as `--audit-severity-*` · `low` promoted above (2nd consumer); high/mid await 2nd convergence |
| `reviewLayerA/C` (blue `#3D5C73` · plum `#6A4A6E`) · `reviewTechLayerB` (plum `#7C5A7A`) · severity slate `#4A4A45` | varies | BP review-layer colors the public re-derivation did NOT converge on (1 consumer) | stay namespaced in `visual_review_html/tokens.css` · promote only on 2nd-consumer convergence |

### Usage rule for promoted extensions

Promoted tokens go into §0 JSON as new fields and become available for all consumers via sync-tokens.mjs. Consumers may still use the `--review-*` / `--audit-*` namespaces for compatibility · the `accentDark` etc are aliases of the canonical `#7E6720` value.
