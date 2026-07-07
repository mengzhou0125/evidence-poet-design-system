# DNA1 Application Scenarios

DNA1 is framework-agnostic. The *spec* (`spec.md`) defines the design language;
this file defines **how the language applies** across four kinds of build. Each scenario
points to a real reference implementation — copy its patterns rather than reinventing.

<!-- ANTI-CLOBBER · Scenarios C and D are INTENTIONALLY thin stubs (since the 2026-06-09
     3-repo split): C defers to the standalone `svg-diagram-skill`, D to `html-review-skill`,
     which now own the full SVG spec and the review-HTML tag-profiles/extension-tokens
     respectively. This workspace source is the CANONICAL copy and carries the stubs on
     purpose — do NOT re-expand C/D back into full scenarios when syncing to/from the public
     mirror (that regression happened once via a sync clobber · re-stubbed 2026-07-05). If the
     public repo shows full C/D, propagate THIS stubbed canonical outward, not the reverse. -->


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
4. A sync script verifies the CSS variables stay aligned with `spec.md` §0 JSON.

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
2. Copy the DNA1 tokens **verbatim** from `spec.md` §0 into the `<style>` `:root` block.
   Mark them with a comment: `/* DNA1 tokens · verbatim from spec.md §0 */`.
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

**When**: vector content — architecture diagrams, flow charts, decision matrices, concept-framework figures, portfolio card covers.

**Stub · defers to `svg-diagram-skill`** (standalone · owns the TYPE A–F chart taxonomy, the Python-list generation method, and the full DNA1 SVG spec). For any finished diagram, **use that skill directly** — don't hand-build here. Build SVG inline only when it is embedded in a larger build *this* skill is already producing; then keep the non-negotiables: three fonts embedded in `<defs>` (Georgia / Arial / Courier New fallback for offline / PDF), every `<rect>` is `rx="0"`, §0 JSON colors used directly (SVG has no CSS custom properties in all renderers), no `<feDropShadow>` / `<linearGradient>` / decorative effects, solid `<polygon>` arrowheads (connectors 1.5px · dividers 1px), gold `#C8A84B` on only the 1–2 most important paths. Full guidance: `svg-diagram-skill/references/{svg-spec.md, chart-types.md, generation-method.md}`.

> Historical note: the old reference impl `visual-asset-generator` was **deleted 2026-06-10** (superseded by `svg-diagram-skill`); this stub is its successor pointer.

---

## Scenario D · Content-review HTML

**When**: building an HTML surface to review a document — proposed text changes plus rationale annotations side-by-side, or AI-review flags against existing content.

**Stub · defers to `html-review-skill`** (standalone · owns the two layout archetypes [right-rail · ToC+stacked], the two tag profiles [editorial 3×4 · technical 3×3×3], the namespaced `--review-*` / `--audit-*` extension-token definitions, the feedback collector, and DIFF mode). For any review HTML, **use that skill directly**. Build inline only when it is embedded in a larger build *this* skill is already producing; then keep the essentials: copy base tokens from `spec.md` §0, add namespaced `--review-*` / `--audit-*` extension tokens each with an inline `/* WCAG <ratio>:1 ... */` comment (spec §"Extension governance" rule 2), build **CJK-safe font stacks** — the mono + serif stacks MUST carry a CJK font first (`'DM Mono', 'Microsoft YaHei', monospace`) or Windows renders Traditional glyphs (`spec.md` §3), and `border-radius: 0` global.

Full tag-profile schemas (editorial + technical), the copy-into-`:root` extension-token block, the section-pair / audit-box / before-after / ToC / per-section-feedback component patterns, and DIFF mode all live in **`html-review-skill/references/{tag-profiles.md, components.css, feedback-collector.js, diff-mode.md}`**.

> Architectural note: the 2-profile tag system is an **extension** (spec §"Extension governance"), not canonical spec §0 — so the auditor does **not** check tag orthogonality (that would be auditor-enforcing-an-extension). Enforcement is build-time (this scenario → html-review-skill); visual review catches post-edit drift.

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

The spec (`spec.md`) and the anti-patterns (`anti-patterns.md`) are constant across
every scenario and every hybrid. Only the *mechanism* (how tokens reach the element)
changes.
