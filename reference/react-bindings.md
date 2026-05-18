# DNA1 — React Bindings

> React implementation layer for the DNA1 design language.
>
> **Canonical token source: [`design.md`](./design.md).** This file does not redefine tokens —
> it maps them onto React-specific machinery: theme attribute, CSS variable names, component
> class names, file paths, and iteration rules for AI agents editing the React app.
>
> When tokens drift between `design.md` and `theme-dna1.css`, run `npm run sync:tokens`
> from `portfolio/portfolio/`. design.md is canonical. This file must not contradict it.

---

## 1. Theme switching mechanism

DNA1 is applied via the `data-theme="dna1"` attribute on `<html>`. All overrides live in
`src/styles/theme-dna1.css` under `[data-theme="dna1"]` selectors. The Default theme
(no `data-theme`) uses values from `src/styles/variables.css`.

Switching: `ThemeToggle` component (`src/components/ThemeToggle/`) — bottom-right floating
button. Sets `document.documentElement.setAttribute('data-theme', 'dna1')`.

**Rule**: only modify `theme-dna1.css` for DNA1 overrides. Never touch `variables.css` (it
defines the Default theme). Never inline styles outside variables — always reference via
`var(--token-name)`.

---

## 2. Token → CSS variable mapping

Every token in `design.md §0` maps to a CSS custom property defined under
`[data-theme="dna1"] :root`. The sync script (`scripts/sync-tokens.mjs`) verifies these stay
in lockstep.

### Color
| design.md JSON path        | CSS variable                  |
|----------------------------|-------------------------------|
| `color.warmPaper`          | `--color-bg`                  |
| `color.inkBlack`           | `--color-text`                |
| `color.graySubtitle`       | `--color-text-secondary`      |
| `color.grayCaption`        | `--color-text-tertiary`       |
| `color.grayLabel`          | `--color-text-muted`          |
| `color.grayLargeOnly`      | `--color-text-faint`          |
| `color.archiveGold`        | `--color-accent`              |
| `color.coolBlueGray`       | `--color-cta-muted`           |
| `color.warmBorder`         | `--color-border`              |
| `color.cardBg`             | `--color-card-bg`             |
| `color.placeholderBg`      | `--color-placeholder-bg`      |
| `color.surface`            | `--color-surface` · `--color-button-bg` |
| `color.surfaceHover`       | `--color-surface-hover`       |
| `color.progressActiveBg`   | `--color-progress-active-bg`  |
| `color.progressFill`       | `--color-progress`            |
| `color.progressFillLight`  | `--color-progress-light`      |
| `color.activeBorder`       | `--color-active-border`       |

### Type
| design.md JSON path | CSS variable    | Resolved value (with fallback stack)                                |
|---------------------|-----------------|---------------------------------------------------------------------|
| `font.serif`        | `--font-serif`  | `'Playfair Display', Georgia, serif`                                |
| `font.sans`         | `--font-sans`   | `'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif`|
| `font.mono`         | `--font-mono`   | `'DM Mono', ui-monospace, monospace`                                |

### Other
| design.md JSON path  | CSS variable / target                                          |
|----------------------|----------------------------------------------------------------|
| `easing`             | `--ease-default`                                               |
| `borderRadius` (= 0) | `--radius-sm` · `--radius-md` · `--radius-lg` · `--radius-xl` · `--radius-2xl` · `--carousel-nav-radius` (all 0) |
| `spacing[]`          | `--spacing-2xs` (4) · `--spacing-xs` (8) · `--spacing-sm` (12) · `--spacing-md` (16) · `--spacing-lg` (20) · `--spacing-xl` (24) · `--spacing-2xl` (32) · `--spacing-3xl` (40) · `--spacing-4xl` (48) · `--spacing-5xl` (64) · `--spacing-6xl` (80) · `--spacing-7xl` (120) |

---

## 3. Case-study CSS utilities

These are React-only utility classes used by case study tsx pages. They encode the
component patterns described in `design.md §4` as CSS classes, but the patterns themselves
(layout, typography, color) come from design.md tokens.

Defined in `src/pages/IndeedCaseStudy.css` (canonical for `cs-*` utilities) and consumed
across all case-study pages.

| Class                  | Purpose                                                              |
|------------------------|----------------------------------------------------------------------|
| `.cs-hero`             | Case study hero block (label + h1 + tag list + 2-3 context paras)    |
| `.cs-section`          | Standard case study section · grid-12 wrapper                        |
| `.cs-section__label`   | Mono label above section title                                       |
| `.cs-section__title`   | Serif h2 (28px desktop / 24px mobile)                                |
| `.cs-section__body`    | Sans body block within a section                                     |
| `.cs-section__body--spaced` | Body block with `margin-top: 2xl` between adjacent paras        |
| `.cs-image`            | Image container (radius 0 · max-width 100%)                          |
| `.cs-image--spaced`    | Adds `margin-top: 3xl` for stacked usage                             |
| `.cs-image__compare-labels` | Before/After labels overlaid on side-by-side images             |
| `.cs-metrics`          | Metric highlight grid (default 1-col)                                |
| `.cs-metrics--two`     | Two-column metric variant (TTConsent outcome)                        |
| `.cs-metric__value`    | Serif 36px metric number                                             |
| `.cs-quote`            | Pull-quote block · 3px gold left border (DNA1) · 16px italic         |
| `.quote`               | Small quote variant · 14px line-height 1.7 · used with `.cs-quote`   |
| `.cs-quote__source`    | Quote source attribution (Label M · Mono 13px)                       |

**Mobile rule**: `.cs-image { margin-top: 3xl }` at `≤1024px` — provides 40px breathing
room when col-split layouts collapse to stack.

---

## 4. Caption system

Implements `design.md §4 · Caption System` (Style A / Style B).

| Class               | Style                                            |
|---------------------|--------------------------------------------------|
| `.caption`          | Wrapper · Sans 14px · `--color-text-tertiary` (#666) · line-height 1.7 |
| `.caption-title`    | Style A title — Serif 16px weight 600            |

**Style A** (split-at-colon · default):
```tsx
<div className="caption">
  <p className="caption-title">Title before colon</p>
  <p>Body text after colon — usually 1-2 sentences.</p>
</div>
```

**Style B** (single paragraph · when no internal split):
```tsx
<p className="caption">Single descriptive sentence.</p>
```

**CSS specificity caveat**: `.caption > p:not(.caption-title)` (specificity 0,2,1) is
required to override `.col p:not([class])` (specificity 0,1,1) which would otherwise
force the body p to 16px instead of 14px.

---

## 5. Layout patterns

`design.md §5` defines the spacing scale and grid; React expresses it via:

- **`Grid` component** (`src/components/Grid/`) — wraps content in `.container.grid-12`
- **`Col` component** — `<Col span="1 / 7">` accepts CSS-grid column shorthand

**Common case-study split**:
```tsx
<Col span="1 / 7">  {/* text col: label + title + body */}
  ...
</Col>
<Col span="8 / -1"> {/* image col: image + caption */}
  ...
</Col>
```

The `1 / 7` + `8 / -1` pattern (5 + 1 gap + 6) is the canonical case-study split. The
`grid-12 > .cs-section` rule snaps direct grid-12 children inside a section to default
`1 / 9`, with explicit overrides for full-bleed elements (`.cs-image` · `.caption` ·
`.cs-metrics` · `.cs-compare` · `.cs-carousel` · `.cs-two-col` get `1 / -1`).

**Sticky-scroll item layout**: `VerticalStickyScroll` component implements
`design.md §4 · Sticky-Scroll Item` — text col `1/6` · image col `7/-1` · gap `5xl`
desktop / `3xl` mobile · top-aligned.

---

## 6. Component → design.md pattern map

| React component                          | design.md §              |
|------------------------------------------|--------------------------|
| `ProjectCard`                            | §4 · Project Card        |
| `VerticalStickyScroll`                   | §4 · Sticky-Scroll Item  |
| `BeforeAfterSlider`                      | §4 · Before/After Slider |
| `cs-metrics` / `cs-metrics--two`         | §4 · Metrics Highlight   |
| `AccordionCarousel`                      | §4 · Accordion Carousel  |
| `ButtonProgressCarousel`                 | §7 · Auto-play disclosure|
| `Hero` (with gold left border subtitle)  | §4 · Universal rules     |
| `Nav` (serif name + mono links)          | §3 · Type roles          |
| `ThemeToggle`                            | §1 · This file           |

---

## 7. File structure

```
portfolio/
├── style/
│   ├── design.md              ← canonical token source · this file's parent
│   ├── react-bindings.md      ← THIS FILE
│   ├── design-md-preview.html ← public live-preview (renders design.md)
│   └── dna证据诗人.md          ← upstream DNA direction (positioning rationale)
│
└── portfolio/                  ← React app (Vite)
    ├── src/
    │   ├── styles/
    │   │   ├── variables.css   ← Default theme variables · DO NOT MODIFY for DNA1
    │   │   └── theme-dna1.css  ← DNA1 overrides via [data-theme="dna1"]
    │   ├── components/
    │   │   ├── ThemeToggle/
    │   │   ├── VerticalStickyScroll/
    │   │   ├── BeforeAfterSlider/
    │   │   ├── AccordionCarousel/
    │   │   ├── ButtonProgressCarousel/
    │   │   └── ...
    │   └── pages/
    │       ├── IndeedCaseStudy.css ← canonical for .cs-* utilities
    │       └── *CaseStudy.tsx       ← case study pages (consume cs-* + caption + Col)
    └── scripts/
        └── sync-tokens.mjs     ← verify design.md ↔ theme-dna1.css ↔ skill specs
```

---

## 8. Iteration rules for AI editing the React app

1. **Look up tokens in `design.md`**, never guess from memory or copy hex from existing CSS
2. **Modify only `theme-dna1.css`** for DNA1 overrides (not `variables.css` · not component CSS)
3. **For new case-study sections**: use existing `cs-*` utilities first; only add new classes
   if a genuinely new pattern is needed (and update this file plus design.md if so)
4. **For new components**: follow the universal rules from `design.md §4` —
   sharp corners · gold hover-left-border · mono labels · serif titles · hover-only shadow
5. **Honor the four guardrails (`design.md §9`)** — non-negotiable
6. **Spacing**: pull only from `--spacing-*` variables (the 4px-rooted scale)
7. **After token edits**: run `npm run sync:tokens` from `portfolio/portfolio/` — must pass
8. **Run `npm run build`** before declaring done — TypeScript + Vite must succeed
9. **Don't touch unrelated code** — surgical changes only

---

## 9. Maintenance

This file extends `design.md` with React-specific implementation. Update this file when:

- A new React component encodes a `design.md` pattern (add row to §6)
- A new `cs-*` utility class is added (add row to §3)
- A new CSS variable is introduced (add row to §2 mapping)
- The React file structure changes (update §7)

When `design.md` tokens change, `npm run sync:tokens` verifies CSS is in lockstep —
no manual update needed in this file unless the *mapping* itself changes.

**Upstream**: `design.md` is canonical for tokens, components, layout, and motion rules.
This file is downstream React mapping only.
