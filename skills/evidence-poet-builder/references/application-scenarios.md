# DNA1 Application Scenarios

DNA1 is framework-agnostic. The *spec* (`dna1-spec.md`) defines the design language;
this file defines **how the language applies** across four kinds of build. Each scenario
points to a real reference implementation — copy its patterns rather than reinventing.

## How to use this file

Match the three bootstrap questions to a scenario:

| Q1 Framework | Q2 Host | Q3 Content shape | → Scenario |
|---|---|---|---|
| React / TSX | own host or in-app | narrative / story | **A · React narrative** |
| vanilla HTML/CSS/JS | static file or own host | data-dense table / list | **B · Vanilla data-dense** |
| SVG | embedded asset | diagram / chart / framework figure | **C · SVG diagram** |
| HTML (vanilla or React) | static file or in-app | content review (proposed changes + rationale) | **D · Content-review HTML** |

If the build is a hybrid (e.g., a data-dense React page), read the two closest scenarios
and merge — the translation guide at the end bridges vanilla↔React.

---

## Scenario A · React app · narrative / story content

**When**: React-based, content is narrative-heavy (hero sections, about, project cards,
blog posts, case studies). You want hover/scroll interactions, multi-step carousels,
before/after sliders, lightboxes.

**Reference implementation**: a deployed React portfolio app — `Hero`, `About`, `Nav`,
`ProjectsGrid`, `AccordionCarousel`, `BeforeAfterSlider`, `VerticalStickyScroll`,
`Lightbox`, `ThemeToggle` components.

**How DNA1 applies in React**:
1. Add `data-theme="dna1"` to `<html>`.
2. All token overrides live in one file (`theme-dna1.css`) under `[data-theme="dna1"] :root { … }`.
3. Components reference values via `var(--token-name)` — never inline a literal color / size.
4. A sync script verifies the CSS variables stay aligned with `dna1-spec.md` §0 JSON.

**Token → CSS-variable mapping** (the canonical naming · use these exact names):

| spec §0 path | CSS variable |
|---|---|
| `color.warmPaper` | `--color-bg` |
| `color.inkBlack` | `--color-text` |
| `color.graySubtitle` / `grayCaption` / `grayLabel` | `--color-text-secondary` / `-tertiary` / `-muted` |
| `color.archiveGold` | `--color-accent` |
| `color.coolBlueGray` | `--color-cta-muted` |
| `color.warmBorder` | `--color-border` |
| `color.cardBg` | `--color-card-bg` |
| `spacing[]` | `--spacing-2xs` (4) … `--spacing-7xl` (120) |
| `easing` | `--ease-default` |
| `borderRadius` (= 0) | `--radius-*` (all 0) |

**Reusable patterns** (all 7 design.md §4 components + 2 composition patterns):
- **Hero** — mono label + serif H1 + sans subtitle · 3px gold left-border accent on subtitle (composition pattern · not in spec §4)
- **Project card** — white bg · 1px warm border · radius 0 · gold left-border on hover · mono company label · serif title · cool-blue CTA with arrow suffix
- **Sticky-scroll** — text col + image col · top-aligned · gap from the spacing scale
- **Caption** — 2 styles · Style A serif-title 16/600 + sans body 14 #666 (split-at-colon) · Style B sans 14 #666 single para (when no internal split) · pair with images in sticky-scroll / lightbox
- **Before/after slider** — sharp viewport · 2px gold center handle · mono labels (44×44 hit area per §10)
- **Metrics highlight** — 1- or 2-col grid · sharp cell borders · value Serif 36/700 ink black · label Sans 13 #666 · use to highlight outcome numbers
- **Accordion carousel** — width-only widen (bookmark-reveal · no scaling) · 0.55s canonical easing · active BG `var(--color-progress-active-bg)` · border `var(--color-active-border)` · pair with autoplay disclosure (gold progress bar per §7)
- **Link patterns** — 3 patterns role-driven · NEVER reverse: (a) Card CTA Mono 13 #527590 no-underline arrow-suffix · (b) Body inline Sans inherit #527590 underline 2px offset · (c) Structural nav Mono #717171 (gold-underline on active section nav) · ✗ gold / ink as link color
- **Theme toggle** — floating button sets `data-theme="dna1"` on `<html>` (mechanism · not a component)

---

## Scenario B · Vanilla single-file · data-dense

**When**: data-dense UI (tables with many columns, multi-tab nav, sortable/filterable
rows, status signals). Single-file or static deploy, no build step. Optionally a tiny
local server.

**Reference implementation pattern**: a single-file `<your-app>.html` — full UI with CSS in `<style>` block and JS in `<script>` block · no build step. Optionally served by a zero-dep Node `http` server (or any static server) for development. Pattern shipped with this skill includes 2 reference impls (one with JD/application context · one with generic-project context) — see workspace internal repo for actual files · pattern is identical regardless.

**How DNA1 applies in vanilla**:
1. `<html data-theme="dna1">` works in vanilla too (or just apply tokens at `:root`).
2. Copy the DNA1 tokens **verbatim** from `dna1-spec.md` §0 into the `<style>` `:root` block.
   Mark them with a comment: `/* DNA1 tokens · verbatim from dna1-spec.md §0 */`.
3. Import the three fonts via Google Fonts `<link>` in `<head>` (Playfair Display ·
   Plus Jakarta Sans · DM Mono).

**Reusable patterns**:
- **DNA1 tokens verbatim copy** — direct copy of §0 JSON values into CSS custom properties
- **Status signals without emoji** — a 6×6px solid CSS swatch + a text label (`<span class="swatch swatch--green"></span> Green`). NEVER 🟢🟡🔴. This is a hard rule (see anti-patterns).
- **Two-tier signal-color extension** — for status UIs: a `--bright-*` solid set (swatch
  dots, accent bars), a `--tint-*` low-alpha set (background tints), an `--ink-*` set
  (WCAG-pass text on tint). These are extensions — namespace + WCAG rationale required.
- **Sticky-left columns + frozen header** — `position: sticky` + z-index layering for wide tables
- **Body-level tooltip overlay** — a single `position: fixed` div appended to `<body>`,
  positioned via `clientX/Y` — sidesteps stacking-context-trapped popovers
- **Tab navigation with `history.pushState`** — URL-hash tabs with browser back-button support

**Backend (optional)**: a zero-dependency Node `http` server — single file, `node server.mjs`
runs it, no npm install. Bind `0.0.0.0` for LAN access; a canonical JSON file acts as the store.

---

## Scenario C · SVG diagram

**When**: vector content — architecture diagrams, flow charts, decision matrices,
concept-framework figures, portfolio card covers.

**Reference implementation**: the [`svg-diagram-skill`](https://github.com/mengzhou0125/svg-diagram-skill)
— a standalone Claude skill (separate repo) that is the depth-specialist for the SVG
diagram surface (chart-type taxonomy TYPE A–F · Python-list generation method · validation
pipeline · pluggable spec with DNA1 bundled as default). If you are generating a finished
standalone diagram, **install and use that skill directly** instead of hand-building. Build
SVG by hand from this scenario only when the diagram is embedded in a larger build this
skill is producing.

```bash
git clone https://github.com/mengzhou0125/svg-diagram-skill && cd svg-diagram-skill && ./install.sh
```

**How DNA1 applies in SVG**:
1. Embed the three fonts in `<defs><style>@import url(...)</style></defs>` (or fall back
   to Georgia / Arial / Courier New for offline / PDF embedding).
2. Every `<rect>` is `rx="0" ry="0"` — sharp corners, no exceptions.
3. Colors are the §0 JSON values directly (SVG has no CSS custom properties in all renderers).
4. No `<feDropShadow>`, no `<linearGradient>`, no decorative effects.
5. Arrowheads = solid `<polygon>` triangles. Connector lines 1.5px; dividers 1px.
6. Gold `#C8A84B` 3px solid line marks only the 1–2 most important paths — never decoration.

**Reusable patterns**:
- **Vertical spacing tokens** — a small fixed scale (tight / compact / section / major /
  margin), referenced as named constants in generation code, never as magic numbers.
- **Canvas sizing top-down** — compute the core content width first; canvas width is its
  derivative; height accumulates from content. Never fix the canvas then bump it.
- **`foreignObject` for any wrapping prose** — long text uses `<foreignObject>` + an HTML
  `<div>` so it reflows; only short single-line labels use `<text>`.

---

## Scenario D · Content-review HTML

**When**: building an HTML surface to review a document — proposed text changes plus
rationale annotations side-by-side, or AI-review flags against existing content.

**Reference implementation**: the [`html-review-skill`](https://github.com/mengzhou0125/html-review-skill)
— a standalone Claude skill (separate repo) that is the depth-specialist for the
content-review surface (2 layout archetypes · 2 tag profiles · multi-layer review roles ·
DIFF mode · CJK font discipline · feedback collector · pluggable spec with DNA1 bundled
as default). If you are producing a finished review HTML, **install and use that skill
directly** instead of hand-building from this scenario. The condensed walkthrough below is
for inline review-HTML chunks embedded inside a larger build this skill is producing, or
as quick reference when the dedicated skill isn't installed.

```bash
git clone https://github.com/mengzhou0125/html-review-skill && cd html-review-skill && ./install.sh
```

**How DNA1 applies to review HTML** (build directly from this scenario · no separate framework to copy):
1. Copy the DNA1 base tokens verbatim (same as Scenario B · from `dna1-spec.md` §0).
2. Add review-semantic **extension** tokens — namespaced `--review-*` / `--audit-*` — for status, layer, and severity (definitions below). Every extension token carries an inline WCAG rationale (per spec §"Extension governance" rule 2).
3. Import the three fonts — and **build CJK-safe stacks**: review-HTML status/layer tags are often Chinese (`改` / `删` / `D 精简`) and render in *mono*, so the **mono and serif stacks MUST include a CJK font first** among fallbacks (`'DM Mono', 'Microsoft YaHei', monospace` · `'Playfair Display', 'Microsoft YaHei', serif`) or Windows renders Traditional glyphs (per `dna1-spec.md` §3 "CJK / i18n font fallback"). Tip: define `--font-sans/serif/mono` once in `:root` and reference `var(--font-*)` everywhere, so the stack can't drift per-rule. Sharp corners everywhere (`border-radius: 0` global reset).
4. Layout — **pick ONE of two archetypes** (both share a left ToC + per-section feedback; they differ only in *where the annotations sit*):
   - **(A) right-rail** — main content column + a sticky annotation rail on the right; per-section feedback at the bottom of the rail. Best when annotations read beside the content (case study · doc revision · narrative).
   - **(B) ToC + stacked** — a left sticky table-of-contents nav + single-column sections; each section's annotations stack *under* its content, with feedback at the bottom of the stack. Best for long technical / spec / architecture reviews (10+ sections · jump-nav matters).
   Separate sections with 1px horizontal dividers.

**Tag system (BP rule · 2 profiles · pick per use case)**:

> **Two coexisting tag schemas** — pick per use case (editorial vs technical).

### Profile A · Editorial review (for case study · doc revision · narrative content)

Schema: **3 status × 4 layer = 12 combos**, plus 3-level audit-box severity gradient (informational only).

| Status (action type · 3 values) | Layer (design dimension · 4 values) |
|---|---|
| **改** · modified (gold-dark #7E6720) | **A 故事** · capability signal / story arc (cool blue #3D5C73) |
| **原** · kept original (gray #717171) | **B 分层** · body ↔ caption layering (olive #5E5840) |
| **删** · deleted (terracotta #A85F4D) | **C 去拉踩** · remove ego / soften absolutes (plum #6A4A6E) |
| | **D 精简** · density / dedup / shorten (slate #4A4A45) |

Audit-box severity gradient (separate · informational): `--audit-severity-high/mid/low`.

CSS classes: `.change-tag` (status) · `.r-tag.layer-a/b/c/d` (layer) · `.audit-box .sev-high/mid/low` (audit-box severity).

### Profile B · Technical review (for code · spec · architecture · cross-layer audit)

Schema: **3 axes × 3 variants = 9 distinct colors**. Each finding carries up to 3 tags (one per axis).

| Status (warm) | Layer (cool/earth) | Severity (grayscale) |
|---|---|---|
| **REV** revise (blue-gray #527590) | **A** spec-internal (forest green #5A7A5A) | **P0** must (ink #1A1A18) |
| **KEPT** approve (gold-dark #7E6720) | **B** cross-layer (plum #7C5A7A) | **P1** should (mid #555555) |
| **DEL** remove (terracotta #A85F4D) | **C** style/wording (slate teal #4E7A85) | **P2** note (light #717171) |

CSS classes: `.tech-tag.tech-status-rev/kept/del` · `.tech-tag.tech-layer-a/b/c` · `.tech-tag.tech-sev-p0/p1/p2`.

### Rules when building a review HTML (both profiles)

- Pick profile first (editorial vs technical) before laying out tags
- Each color extension token gets an inline `/* WCAG <ratio>:1 <text-color-on-this> */` comment
- Profile A: warm-status × cool-layer · severity is separate audit-box gradient
- Profile B: warm-status · cool/earth-layer · achromatic-severity (asymmetry is the visual signal that severity is orthogonal to chromatic axes)

**Why this is a BP rule not a spec rule** (architectural note): this 2-profile tag system is an **extension** (per `design.md` §"Extension governance") · not part of the canonical spec §0. It lives here in builder Scenario D (apply-time guidance) · not in `design.md` (spec authority). Per §"Extension governance" rule 5, extensions promote to spec only when multiple consumers converge. **The evidence-poet-auditor does NOT check tag orthogonality** (would be auditor-enforcing-an-extension-instead-of-spec). Builder enforces at create-time; visual review catches post-edit drift.

### Extension token definitions (copy into your review HTML's `<style>` `:root`)

Canonical review-semantic extensions · namespaced + WCAG-commented per §"Extension governance". Base DNA1 tokens come from `dna1-spec.md` §0 (copy verbatim, same as Scenario B); the block below is the review-specific *addition*.

```css
:root {
  /* ── Profile A · editorial · Status (改/原/删) ── */
  --review-modified-fill: #7E6720;  /* gold-dark · WCAG 5.5:1 white-on · = §0 promotedExtensions.accentDark */
  --review-kept-fill:     #717171;  /* neutral gray · WCAG 4.6:1 white-on */
  --review-deleted-fill:  #A85F4D;  /* terracotta · WCAG 4.8:1 white-on · no DNA1 base equivalent */
  --review-modified-light: #F8F2E0; /* outlined-card tint · WCAG 11.8:1 ink-on */
  --review-deleted-light:  #F3EAE7; /* outlined-card tint · WCAG 11.4:1 ink-on */

  /* ── Profile A · editorial · Layer (A 故事 / B 分层 / C 去拉踩 / D 精简) ── */
  --review-layer-a: #3D5C73;  --review-layer-b: #5E5840;  --review-layer-c: #6A4A6E;  --review-layer-d: #4A4A45;

  /* ── audit-box severity gradient (informational · NOT a tag axis) ── */
  --audit-severity-high: var(--review-deleted-fill);  --audit-severity-mid: #7E6720;  --audit-severity-low: #5A8A5A;

  /* ── Profile B · technical · 3 axes × 3 variants (9 colors) ── */
  --review-tech-status-rev:  #527590;  --review-tech-status-kept: #7E6720;  --review-tech-status-del:  #A85F4D;
  --review-tech-layer-a:     #5A7A5A;  --review-tech-layer-b:     #7C5A7A;  --review-tech-layer-c:     #4E7A85;
  --review-tech-severity-p0: #1A1A18;  --review-tech-severity-p1: #555555;  --review-tech-severity-p2: #717171;
}
```

All tags: filled mono-uppercase chips · `font-size` ~10px · `letter-spacing: 0.06em` · white text on the fills above · `border-radius: 0`.

**Reusable component patterns** (build in prose · same depth as Scenarios A/B):
- **Section-pair grid** — `display: grid` · main content (left, flexible) + sticky review notes (right, ~480px) · 1px warm-border divider between pairs
- **Status / layer / severity tags** — filled mono-uppercase chips per CSS classes above
- **Audit-box** — informational panel · cool-blue-gray left accent (`border-left: 3px solid var(--color-cta-muted)`) · distinct from status colors (information ≠ change)
- **Before/after compare blocks** — coral-tint "before" (`--review-deleted-light`) · gold-tint "after" (`--review-modified-light`) · gold = proposed change
- **Left ToC nav** — sticky left column (`~240px`) of `<a href="#section-id">` anchors + `html { scroll-behavior: smooth }`; collapses to a top band on narrow screens. Both archetypes use it.
- **Per-section feedback + copy-all** — for reviews where the user rates each section: give each section a feedback block (a label + `✓ approve` / `⚠ revise` / `✗ reject` checkboxes + a notes `<textarea>`), at the bottom of that section's annotations. Add ONE fixed **"📋 Copy all feedback"** button — a small self-contained `<script>` IIFE that walks every feedback block, serializes section-label + checked ratings + notes + a summary tally, and writes the digest to the clipboard, so the user pastes one block into chat and the AI continues revising. **The page saves no data** (ephemeral DOM · serialize-on-demand · no localStorage / backend).
- **Clean state** — dashed low-contrast box "section reviewed · no flags" so reviewed-fine reads differently from unreviewed
- **DIFF mode** — re-reviewing an edited doc: section-level change tags (NEW / EDITED / RESTRUCTURED / UNCHANGED) · changed sections get gold tint + changebar · unchanged collapse to one line

**Working examples to model on** (illustrations · not required dependencies): any Pass A review HTML in your case-study `_review/` folders (Profile A) · any multi-layer architecture review HTML (Profile B). The pattern is fully specified above.

---

## Scenario E · Hybrid (added 2026-05-26 per §3 P2)

**When**: build doesn't cleanly match A/B/C/D — it's a combination. Common cases:
- **React data-dense page** (A + B) — React component framework + sticky tables / multi-tab nav
- **React + embedded SVG diagram** (A + C) — narrative page with inline SVG charts
- **Vanilla data-dense + content-review** (B + D) — review HTML for a data-heavy artifact (annotated table)

**How to handle**: read the 2 closest scenarios · take patterns from each · resolve any conflicts (e.g. React data-dense uses Scenario A's `data-theme="dna1"` mechanism + Scenario B's sticky table patterns + Scenario A's `var(--token)` for colors).

**Common hybrid worked examples**:

| Hybrid | Scenarios merged | How to merge |
|---|---|---|
| React data-dense page | A + B | Scenario A mechanism (`data-theme` + `var()`) + Scenario B patterns (sticky table, swatch status, tab nav lifted to router) |
| React narrative w/ inline SVG | A + C | Scenario A for React structure · Scenario C patterns for the SVG content (rx=0 · 3 fonts in defs · gold for 1-2 key paths only) |
| Vanilla review HTML for data | B + D | Scenario B for table/sticky-cols + Scenario D for section-pair grid + rationale sidebar |

---

## When none of A-D fits · workflow (added 2026-05-26 per §3 P2)

If your build doesn't match any of A/B/C/D/E:

1. **Pause** — don't fabricate a new scenario silently. Discuss with user first.
2. **Document** the unique constraints: framework / host / content shape / state needs that don't match A-E.
3. **Propose a Scenario F** — write the reference impl + reusable patterns following A-E template.
4. **Get user approval** before treating Scenario F as canonical.
5. **Add Scenario F** to this file (follow your skill-authoring workflow · tier T2-T3 in `preservation_discipline` BP).

**Anti-pattern**: silently inventing a 5th approach because the build "feels close to" one of A-D. If it doesn't fit, that's signal — talk to user before committing to a build pattern.

---

## Translation guide · vanilla ↔ React

If you are building in React but want a pattern from a vanilla reference:

| Vanilla | React equivalent |
|---|---|
| `<style>` block tokens | move to `theme-dna1.css` under `[data-theme="dna1"]` |
| `<script>` event handlers | lift to `useEffect` + `useState` |
| `getElementById` queries | `useRef` or controlled state |
| `fetch()` polling | `useEffect` + `setInterval`, or a data-fetching hook |
| `history.pushState` tabs | router routes (`useNavigate` + `useLocation`) |
| body-level tooltip div | a portal (`createPortal(<Tooltip/>, document.body)`) |
| sticky-left / sticky-top table | same CSS · wrap in a component returning `<table>` |

If building in vanilla but copying a React pattern: `data-theme="dna1"` works on
`<html>` in vanilla; inline `theme-dna1.css` into the `<style>` block; React components
become HTML semantic sections with the same class names.

---

## Hybrid builds

Most real builds are hybrids. Rules of thumb:
- **Data-dense React page** → Scenario A mechanism (`data-theme` + `var()`) + Scenario B
  patterns (sticky table, swatch status, tab nav lifted to router)
- **Narrative vanilla page** → Scenario B mechanism (inline tokens) + Scenario A patterns
  (hero, card, sticky-scroll as semantic sections)
- **Diagram inside a page** → Scenario C for the SVG + the host page's scenario for the frame

The spec (`dna1-spec.md`) and the anti-patterns (`anti-patterns.md`) are constant across
every scenario and every hybrid. Only the *mechanism* (how tokens reach the element)
changes.
