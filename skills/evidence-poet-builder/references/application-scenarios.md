# Evidence Poet Application Scenarios

Evidence Poet is framework-agnostic. The *spec* (`spec.md`) defines the design language;
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

**How Evidence Poet applies in React**:
1. Add `data-theme="evidence-poet"` to `<html>`.
2. All token overrides live in one file (`theme-evidence-poet.css`) under `[data-theme="evidence-poet"] :root { … }`.
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
- **Theme toggle** — floating button sets `data-theme="evidence-poet"` on `<html>` (mechanism · not a component)

---

## Scenario B · Vanilla single-file · data-dense

**When**: data-dense UI (tables with many columns, multi-tab nav, sortable/filterable
rows, status signals). Single-file or static deploy, no build step. Optionally a tiny
local server.

**Reference implementation pattern**: a single-file `<your-app>.html` — full UI with CSS in `<style>` block and JS in `<script>` block · no build step. Optionally served by a zero-dep Node `http` server (or any static server) for development. Pattern shipped with this skill includes 2 reference impls (one with JD/application context · one with generic-project context) — see workspace internal repo for actual files · pattern is identical regardless.

**How Evidence Poet applies in vanilla**:
1. `<html data-theme="evidence-poet">` works in vanilla too (or just apply tokens at `:root`).
2. Copy the Evidence Poet tokens **verbatim** from `spec.md` §0 into the `<style>` `:root` block.
   Mark them with a comment: `/* Evidence Poet tokens · verbatim from spec.md §0 */`.
3. Import the three fonts via Google Fonts `<link>` in `<head>` (Playfair Display ·
   Plus Jakarta Sans · DM Mono).

**Reusable patterns**:
- **Evidence Poet tokens verbatim copy** — direct copy of §0 JSON values into CSS custom properties
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

**When**: vector content — architecture diagrams, flow charts, decision matrices, hierarchy trees, comparison figures, concept-framework figures.

**Use the [`svg-diagram-skill`](https://github.com/mengzhou0125/svg-diagram-skill) — install and trigger directly.** It's a standalone Claude skill (separate repo · MIT) that is the depth-specialist for this surface: TYPE A–F chart taxonomy + Python-list generation method + validation pipeline + pluggable spec (Evidence Poet bundled as default). **This builder does not reproduce that depth** — for any standalone SVG diagram, install the skill rather than hand-building from this scenario.

```bash
git clone https://github.com/mengzhou0125/svg-diagram-skill && cd svg-diagram-skill && ./install.sh
```

If you must hand-build an SVG inline (e.g. an SVG embedded in a Scenario A React component this skill is producing), the four non-negotiable rules from Evidence Poet Guardrails are: sharp corners (`rx="0"` everywhere) · three fonts only (Playfair serif · Plus Jakarta sans · DM Mono — embedded in `<defs><style>@import …</style></defs>`) · colors come from `spec.md` §0 JSON values directly (SVG has no CSS variable support across renderers) · gold `#C8A84B` 3px solid line marks at most 1–2 important paths, never decoration. For canvas sizing, vertical spacing scale, chart-type layouts, theme switching, and validation — install the skill.

---

## Scenario D · Content-review HTML

**When**: building an HTML surface to review a document — proposed text changes plus rationale annotations side-by-side, or AI-review flags against existing content.

**Use the [`html-review-skill`](https://github.com/mengzhou0125/html-review-skill) — install and trigger directly.** It's a standalone Claude skill (separate repo · MIT) that is the depth-specialist for this surface: 2 layout archetypes (right-rail · stacked) + 2 tag profiles (editorial 3×4 · technical 3×3=9) + multi-layer review roles + DIFF mode + CJK font discipline + feedback collector + pluggable spec (Evidence Poet bundled as default). **This builder does not reproduce that depth** — for any review HTML, install the skill rather than hand-building from this scenario.

```bash
git clone https://github.com/mengzhou0125/html-review-skill && cd html-review-skill && ./install.sh
```

If you must hand-build a review HTML chunk inline (e.g. embedded inside a Scenario A React app), the four non-negotiable rules are: `<html lang="zh-Hans-CN">` for any CJK content (**NOT `zh-CN`** — the `Hans` script subtag is required or Windows renders Han-unified codepoints as Traditional glyphs · this is a recurring failure mode) · CJK-safe font stacks with `Microsoft YaHei` placed first in the CJK fallback chain across all three font roles (define `--font-sans/serif/mono` once in `:root` and reference `var(--font-*)` everywhere · the single source can't re-diverge per-rule) · sharp corners global reset (`* { border-radius: 0 }`) · Evidence Poet base tokens from `spec.md` §0 plus review-extension tokens namespaced `--review-*` / `--audit-*` with inline WCAG rationale per `spec.md` §"Extension governance". For full archetype CSS, tag profile schemas (Profile A editorial 3 status × 4 layer · Profile B technical 3 axes × 3 variants), feedback-collector implementation, DIFF mode mechanisms, and review-role taxonomy — install the skill.

---

## Scenario E · Hybrid (added 2026-05-26 per §3 P2)

**When**: build doesn't cleanly match A/B/C/D — it's a combination. Common cases:
- **React data-dense page** (A + B) — React component framework + sticky tables / multi-tab nav
- **React + embedded SVG diagram** (A + C) — narrative page with inline SVG charts
- **Vanilla data-dense + content-review** (B + D) — review HTML for a data-heavy artifact (annotated table)

**How to handle**: read the 2 closest scenarios · take patterns from each · resolve any conflicts (e.g. React data-dense uses Scenario A's `data-theme="evidence-poet"` mechanism + Scenario B's sticky table patterns + Scenario A's `var(--token)` for colors).

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
| `<style>` block tokens | move to `theme-evidence-poet.css` under `[data-theme="evidence-poet"]` |
| `<script>` event handlers | lift to `useEffect` + `useState` |
| `getElementById` queries | `useRef` or controlled state |
| `fetch()` polling | `useEffect` + `setInterval`, or a data-fetching hook |
| `history.pushState` tabs | router routes (`useNavigate` + `useLocation`) |
| body-level tooltip div | a portal (`createPortal(<Tooltip/>, document.body)`) |
| sticky-left / sticky-top table | same CSS · wrap in a component returning `<table>` |

If building in vanilla but copying a React pattern: `data-theme="evidence-poet"` works on
`<html>` in vanilla; inline `theme-evidence-poet.css` into the `<style>` block; React components
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
