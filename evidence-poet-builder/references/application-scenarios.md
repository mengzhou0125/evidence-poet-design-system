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

**Reusable patterns**:
- **Hero** — mono label + serif H1 + sans subtitle · 3px gold left-border accent on subtitle
- **Project card** — white bg · 1px warm border · radius 0 · gold left-border on hover · mono company label · serif title · cool-blue CTA with arrow suffix
- **Sticky-scroll** — text col + image col · top-aligned · gap from the spacing scale
- **Before/after slider** — sharp viewport · 2px gold center handle · mono labels
- **Theme toggle** — floating button sets `data-theme="dna1"` on `<html>`

---

## Scenario B · Vanilla single-file · data-dense

**When**: data-dense UI (tables with many columns, multi-tab nav, sortable/filterable
rows, status signals). Single-file or static deploy, no build step. Optionally a tiny
local server.

**Reference implementation**: a single-file `application_pipeline.html` — full UI with
CSS in a `<style>` block and JS in a `<script>` block, no build. Optionally served by a
zero-dependency Node `http` server.

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

**Reference implementation**: the `visual-asset-generator` skill (it already encodes DNA1
for SVG). If you are generating a finished diagram, **use that skill directly**. Build
SVG by hand only when the diagram is embedded in a larger build this skill is producing.

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

**Reference implementation**: the `visual_review_html` pattern (workspace BP) — a
canonical token file + component CSS + TypeScript interfaces + a minimal example. Its
companion process doc (`review_html_workflow`) governs *when* to produce a review HTML;
this scenario is *how* to render one in DNA1.

**How DNA1 applies to review HTML**:
1. Copy the DNA1 base tokens verbatim (same as Scenario B).
2. Add review-semantic **extension** tokens — namespaced `--review-*` — for severity
   levels, layer labels, and proposed/original/deleted status. Every extension token
   carries an inline WCAG rationale.
3. Import the three fonts. Sharp corners everywhere (`border-radius: 0` global reset).
4. Layout: a main column + a sticky annotation sidebar, separated by horizontal dividers.

**Reusable patterns**:
- **Section-pair grid** — `display: grid` · main content (left) + sticky review notes (right)
- **Severity tags** — filled mono-uppercase chips · dark fills · WCAG-pass on white
- **Before/after compare blocks** — coral-tint "before" · gold-tint "after" (gold = proposed change)
- **Clean state** — a dashed low-contrast box reading "section reviewed · no flags" — so a
  reviewed-and-fine section reads differently from an unreviewed one
- **DIFF mode** — for re-reviewing an edited doc: section-level change tags (NEW / EDITED /
  RESTRUCTURED / UNCHANGED) · changed sections get a gold tint + changebar · unchanged
  sections collapse to one line

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
