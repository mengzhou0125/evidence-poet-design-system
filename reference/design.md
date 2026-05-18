# DNA1 — The Evidence Poet

> **Design system for mengz.space.** Portable spec — framework-agnostic, AI-readable.
> Use as prompt context when generating components, assets, or layouts in this brand.
>
> Tone: Academic journal × architecture magazine. Mono labels for information order,
> serif headlines for narrative weight, gold lines for moments worth pausing.
> Restrained, rational, but never cold.

---

## 0. Token Source (machine-readable)

> Source-of-truth tokens. A sync script reads this JSON and propagates values to
> `theme-dna1.css` (React app) and `visual-asset-generator/svg-spec.md` (Claude skill).
> Edit values here · run `npm run sync:tokens` · downstream updates automatically.

```json
{
  "version": "1.0.0",
  "color": {
    "warmPaper": "#F8F7F3",
    "inkBlack": "#1A1A18",
    "archiveGold": "#C8A84B",
    "coolBlueGray": "#527590",
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
  "borderRadius": 0,
  "borderWidth": 1,
  "accentLineWidth": 3,
  "shadowHover": "0 2px 12px rgba(0,0,0,0.06)",
  "imageMaxWidth": 1920
}
```

The human-readable tables in §2 / §3 / §5 / §6 derive from this block. JSON is canonical when in conflict.

**Versioning**: the `version` field uses semantic versioning (`MAJOR.MINOR.PATCH`, e.g. `1.0.0` → `1.0.1` → `1.1.0` → `2.0.0`) and **must be bumped on every meaningful change** to this spec. Downstream consumers (the `evidence-poet-design-system` skill, projects with `.claude/design.md`) compare this field to detect drift and auto-update.

Bump policy:
- **PATCH** (`1.0.0` → `1.0.1`) — typo fix · clarification · no token or rule change
- **MINOR** (`1.0.1` → `1.1.0`) — add a new token / pattern / guardrail · existing values unchanged
- **MAJOR** (`1.1.0` → `2.0.0`) — change or remove existing tokens / rules · breaking for downstream consumers

---

## 1. Visual Theme & Atmosphere

The Evidence Poet carries a core tension: "Evidence" (behavioral science,
data-backed, hypothesis-verified) × "Poet" (warm narrative, human understanding,
restrained depth). A person who writes poetry with evidence.

Three key moves define the system:
- **Three-font tension** — serif narrative, sans body, mono annotation; each role kept in its own register
- **Sharp corners globally** — border-radius: 0; precision over friendliness
- **Gold reserved for "worth-noticing" nodes** — used sparingly, as signal rather than decoration

Key Characteristics:
- Warm paper white (#F8F7F3) — archival warmth, not screen-cold
- Hover-only shadows — restrained confidence, responds when engaged
- Single easing curve — cubic-bezier(0.16, 1, 0.3, 1); fast in, slow out
- Motion exists only when invited (one disclosed exception: autoplay carousel progress)

---

## 2. Color Palette & Roles

### Primary
| Name            | Hex       | Role                              | Constraint               |
|-----------------|-----------|-----------------------------------|--------------------------|
| Warm Paper      | #F8F7F3   | Page background                   | —                        |
| Ink Black       | #1A1A18   | Headings, primary text            | —                        |
| Archive Gold    | #C8A84B   | Accent — borders, lines, icons    | NOT for text (2.14:1)    |
| Cool Blue-Gray  | #527590   | CTA link text                     | —                        |
| Warm Border     | #EDE9E2   | Dividers, card borders            | —                        |

### Text Gray Scale (background #F8F7F3)
| Hex     | Ratio  | Role                          | Floor for body text |
|---------|--------|-------------------------------|---------------------|
| #555    | 6.95:1 | Subtitles, descriptions       | ✓                   |
| #666    | 5.36:1 | Captions, card labels         | ✓                   |
| #717171 | 4.55:1 | Section labels, nav links     | ✓ (the floor)       |
| #888    | 3.31:1 | Large text only (≥18px)       | ✗                   |

### Surface & State
| Token          | Value                         | Role                    |
|----------------|-------------------------------|-------------------------|
| Card BG        | #FFFFFF                       | Card surface            |
| Surface        | #f5f5f3                       | Button BG, tag BG       |
| Surface hover  | #eeedea                       | Button hover BG         |
| Progress fill  | rgba(200,168,75,0.12)         | Progress bar fill       |
| Active item BG | #faf6ee                       | Active carousel item bg |
| Active border  | rgba(200,168,75,0.25)         | Active carousel border  |
| Hover shadow   | 0 2px 12px rgba(0,0,0,0.06)   | Hover state only        |

---

## 3. Typography Rules

### Font Stack
| Role   | Font                | Use                 |
|--------|---------------------|---------------------|
| Serif  | Playfair Display    | Headings (h1–h4)    |
| Sans   | Plus Jakarta Sans   | Body text           |
| Mono   | DM Mono             | Labels, nav, CTA    |

### Hierarchy
| Role            | Font   | Size | Weight | LH   | Tracking | Notes                                                                                              |
|-----------------|--------|------|--------|------|----------|----------------------------------------------------------------------------------------------------|
| Display Hero    | Serif  | 48px | 700    | 1.15 | —        | Home hero h1                                                                                       |
| CS Hero         | Serif  | 42px | 700    | 1.2  | —        | Case study h1                                                                                      |
| Section Title L | Serif  | 32px | 700    | 1.2  | -0.02em  | Module h2                                                                                          |
| Section Title M | Serif  | 28px | 700    | 1.3  | —        | Case study section title · sticky-scroll title · About h2                                          |
| Section Title S | Serif  | 24px | 600    | —    | —        | Module h3                                                                                          |
| Hero Subtitle   | Sans   | 18px | 400    | 1.7  | —        | Hero subtitle                                                                                      |
| Body Primary    | Sans   | 16px | 400    | 1.8  | —        | Case study body                                                                                    |
| Body Secondary  | Sans   | 15px | 400    | 1.8  | —        | Card description                                                                                   |
| Body Tertiary   | Sans   | 14px | 400    | 1.6  | —        | Caption body · disclaimer (italic) · quote (small variant) · about method body · compare labels    |
| Label M         | Mono   | 13px | 400    | —    | 0.03em   | uppercase · section labels · nav links · CTA · footer · before/after labels · accordion indicator  |
| Label S         | Mono   | 12px | 400    | —    | 0.06em   | uppercase · hero label · project-card company · section-nav · contact-item                         |
| Tag             | Mono   | 12px | 400    | —    | —        | regular case · skill tags (project-card · cs-hero)                                                 |

### Principles
- Headings tight (LH 1.15–1.3), body relaxed (LH 1.6–1.8) — information density rhythm
- Tighten tracking at ≥32px (-0.02em) — prevents visual looseness on large display
- Widen tracking on uppercase labels (0.03–0.08em) — increases legibility, signals "annotation"
- Only 4 weights: 400 (body / labels), 500 (CTA), 600 (subtitles), 700 (titles)

### Universal Label rule (Label M)
Label M: 13px DM Mono · weight 400 · uppercase · letter-spacing 0.03em · color #717171.
Semantically a label (not a heading) — paragraph element, not h2/h4.
Label S (12px · 0.06em) is reserved for tighter contexts (hero · card meta · sticky nav).

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
- Sharp-cornered viewport · 2px gold center handle · 28×28 knob · ⇄ glyph
- Before/After labels: Label M (Mono 13px uppercase) · top-left + top-right · paper background

### Metrics Highlight
- 1- or 2-column grid · sharp borders between cells
- Value: Serif 36px weight 700 · ink black
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
- Border-radius: 0 globally (every element, no exceptions)
- Shadow: hover-only (default state is flat)
- Transition: 0.3s–0.4s with cubic-bezier(0.16, 1, 0.3, 1)

---

## 5. Layout Principles

### Spacing Scale (4px base)
4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64 / 80 / 120

The scale breathes from element-cluster (8–24px) to page-break (80–120px).
No arbitrary values — every margin/padding draws from the scale.

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
- Shadow: hover-only · 0 2px 12px rgba(0,0,0,0.06)
- Easing: cubic-bezier(0.16, 1, 0.3, 1) — fast in, slow out

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

`gtag` (Google Analytics 4) loads only on production hostname (`mengz.space`). Localhost / preview environments must not load the analytics script — no events of any kind (page_view · clicks · custom events · GTM auto-events) reach production GA from dev.

SPA navigation: `gtag('config', ..., { send_page_view: false })` disables auto page_view; route changes fire `gtag('event', 'page_view', { page_title, page_location, page_path })` manually so each hash route is tracked with the correct title.

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

### B · Type Language (each role in its own register)
- ✓ Serif → narrative authority (headings only)
- ✓ Sans → readable body (paragraphs only)
- ✓ Mono → precise annotation (labels · nav · CTA only)
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

| Element          | Desktop    | ≤1024px   | ≤640px   |
|------------------|------------|-----------|----------|
| Hero h1          | 48px       | —         | 32px     |
| Hero subtitle    | 18px       | —         | 16px     |
| CS h1            | 42px       | 28px      | —        |
| CS section title | 28px       | 24px      | —        |
| Container pad    | 48px       | 24px      | 24px     |
| Sticky-scroll gap| 64px       | 40px      | 40px     |

Touch targets: 44×44px minimum on mobile.
Layout collapses to single column below 640px.

---

## 11. Agent Prompt Guide

### Quick reference

```
Background:  #F8F7F3    CTA text:    #527590
Ink Black:   #1A1A18    Subtitle:    #555
Gold accent: #C8A84B    Caption:     #666
Border:      #EDE9E2    Label:       #717171
```

### Fonts

```
Headings: Playfair Display, 700, serif
Body:     Plus Jakarta Sans, 400, sans-serif
Labels:   DM Mono, 400, monospace
```

### Iteration rules for AI agents
1. Look up values in §0 JSON or §2/§3 tables — never guess from memory
2. New components: sharp corners · gold hover-left-border · mono labels · serif titles
3. Honor the four guardrails (A/B/C/D) — they are non-negotiable
4. Spacing: pull only from the 4px-rooted scale (§5)
5. Motion: single easing curve; default state is flat; shadow on hover only

---

## Maintenance

This file is the **canonical token source** for the DNA1 design language.
Two consumers: my React app (mengz.space) + `visual-asset-generator`,
a Claude skill I built for SVG asset generation. Both reference this file.

<!-- internal-only -->

---

## When you edit this file

`design.md` is canonical. Downstream files must not contradict it.

**After editing tokens (§0 JSON or any §2/§3/§5/§6 table)**:
1. Run `npm run sync:tokens` from `portfolio/portfolio/` — script verifies (and writes) downstream
2. Verify `portfolio/portfolio/src/styles/theme-dna1.css :root` matches §0 JSON
3. Verify `~/.claude/skills/visual-asset-generator/references/svg-spec.md` color/font block matches §0 JSON
4. Verify `portfolio/style/react-bindings.md` (the React implementation guide) cross-references current values

**After editing component patterns (§4)**:
1. Update `portfolio/style/react-bindings.md` — adjust the React class-name / file-path mapping
2. AI sessions modifying React components will load this file via inner CLAUDE.md

**After editing image standards (§8)**:
1. Update `portfolio/best_practices/image_assets.md` — workflow + audit lives there

**Sync rule**: this file is canonical. `react-bindings.md`, `theme-dna1.css`, `svg-spec.md`, `image_assets.md`, `meta_practice/best_practices/workflow/visual_review_html/tokens.css`, and `positioning/_outputs/application_pipeline.html` must not contradict it. When drift is detected, this file wins. Verify via `npm run sync:tokens` (covers 4 token-holding consumers as of 2026-05-16).

**Upstream**: positioning rationale + DNA direction lives at `dna证据诗人.md` (read-only reference, edit only when positioning changes).

---

## Extension governance · how to add non-canonical tokens

> Added 2026-05-16 after `visual_review_html` BP promotion surfaced the need for explicit rules.

DNA1 base tokens (§0 JSON) cover the visual language baseline. Specific consumers (review HTML · data-dense tools · status/signal UIs) need additional tokens not in the base set (severity colors · env signals · review-semantic labels · etc.). These are **extensions** · the discipline:

**5 rules for adding extension tokens** (any consumer):

1. **Namespace prefix is mandatory** — never collide with base. Use `--review-*` (review HTML) · `--bright-*` / `--tint-*` / `--ink-*` (env signals in pipeline tools) · `--severity-*` (cross-consumer severity) · `--<consumer>-*` for consumer-specific extensions.
2. **WCAG rationale inline** — for any color used with text on it · document contrast ratio. Example: `--color-accent-dark: #7E6720; /* derived darker gold · WCAG-AA pass (5.5:1 white-on-this) · for text-bearing gold */`.
3. **Derivation explicit** — if extension derives from a base token (darken/lighten/alpha), state the lineage. Example: `--review-改-fill: var(--color-accent-dark);` not a raw hex.
4. **Live with the consumer** — extension tokens go in the consumer's tokens file (e.g., `visual_review_html/tokens.css`), NOT in this `design.md` §0 JSON. §0 stays the baseline-only canonical.
5. **Cross-consumer convergence triggers promotion** — if multiple consumers invent the same semantic extension (e.g., `--severity-high/mid/low` appears in 2+ consumers), candidate to promote to design.md as a `§"Status / Signal extension"` sub-section (not §0 base · base stays narrow). Currently 0 cross-consumer convergence promoted · `--severity-*` lives in `visual_review_html/tokens.css` only.

**Anti-pattern · drift via approximation**: when adding a new consumer, NEVER eyeball hex values from memory. Copy verbatim from §0 JSON OR import `theme-dna1.css` / `visual_review_html/tokens.css`. Drift caught 2026-05-15 (my own review_html_workflow CSS skeleton drifted on `bg` / `gold` / `border` / `muted` / `dim` · all approximate · 0 WCAG rationale) · root cause was eyeballing. Fixed by 2026-05-16 promotion (BP doc canonical · sync-tokens.mjs §9 audit guard).

<!-- /internal-only -->
