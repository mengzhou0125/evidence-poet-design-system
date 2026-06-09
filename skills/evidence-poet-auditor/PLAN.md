# evidence-poet-auditor · detailed plan

> **Status**: v0.4 SHIPPED 2026-05-25 · **12 of 13 numbered dimensions live + spec-rootedness invariant codified** (only #3c density deferred · genuinely runtime-bound) · 1893 LOC across modular structure · 4 surface profiles · 3 output formats (terminal/JSON/HTML) · `--define-profile` interactive flow · deployed to `~/.claude/skills/`. **v0.4 architectural cleanup**: (1) #12 tag orthogonality REMOVED from auditor · moved to evidence-poet-builder skill (BP rule · not spec rule · auditor only enforces spec) · (2) #10 consumer list synced to design.md §"Sync rule" v2026-05-25 (4 canonical consumers) · (3) #3b pair rhythm + #3c density floors PROMOTED to design.md §5 (Option A) so spec backs the check. **Deferred (with reasoning)**: dim #3c density (genuinely requires runtime headless browser · would violate 0-deps invariant) · Phase 8.5 nightly_audit.sh integration (operational, per user direction).

## 0 · Architectural invariant · spec-rootedness (codified 2026-05-25)

**Rule**: every auditor dimension must root in an upstream spec rule (design.md). If auditor enforces a rule not in spec, the auditor is *inventing law*, not *auditing*. Two consequences:

1. **Builder ↔ Auditor symmetry**: builder enforces spec at create-time · auditor enforces spec at post-create-time · same rule, two phases. If auditor checks something builder doesn't know about, user gets surprise drift flags.
2. **BP rules belong in builder, not auditor**: BP conventions (e.g., 9-color orthogonal tag system for review HTML) live in BP docs + builder skill. Auditor enforcing BP rules = jumping authority (auditor-as-judge over BP-as-evidence).

**Authority chain**: design.md (spec) → builder skill (apply-time, BP-aware) → auditor (post-build, spec-only). Spec promotion (BP → spec) per design.md §"Extension governance" rule 5 — needs cross-consumer convergence.

**Per-dim spec roots**:

| # | Dim | Spec root | Notes |
|---|---|---|---|
| 1 | Hex canonical | §0 JSON color block | direct token map |
| 3a | Spacing scale | §0 spacing + §5 Spacing Scale | direct scale check |
| 3b | Pair rhythm | §5 "Pair rhythm (within-file consistency)" | **PROMOTED 2026-05-25 (Option A)** |
| 3c | Density floor | §5 "Density floors (per surface type)" | **PROMOTED 2026-05-25 (Option A)** · runtime-deferred |
| 4 | Font family | §0 font + §3 Font Stack | direct list |
| 5 | Type role | §9-B Guardrail B + §3 Hierarchy | semantic role map |
| 6 | Border-radius | §0 borderRadius + §6 + §9-A | declared 3x in spec |
| 7 | Color discipline | §9-C Guardrail C | gold-as-text + sub-floor grays |
| 8 | Motion easing | §0 easing + §6 + §7 + §9-D | declared 4x |
| 9 | Shadow | §6 + §7 + §9-A + §"Featured-state shadow exceptions" | hover-only + featured exceptions |
| 10 | Cross-surface | §"Sync rule" 4 canonical consumers | synced to spec list |
| 11 | WCAG contrast | §2 Text Gray Scale ratios · WCAG AA 4.5:1 (industry standard inherited) | implicit threshold |
| 12 | Extension governance (5 rules) | §"Extension governance" rules 1-5 | namespace + WCAG comment + derivation + locality + promotion |
| ~~12 sub~~ | ~~Tag orthogonality~~ | ~~`review_html_workflow.md` BP~~ | **REMOVED FROM AUDITOR 2026-05-25** → builder skill scenario D |

All 12 dimensions now spec-rooted. Audit ↔ spec coherence guaranteed.
>
> **Original status** (preserved): PLAN created 2026-05-25 in response to user push-back that the v3 EP case study's framing "mechanically check artifact against spec · report violation" was too thin.
>
> **Authority**: this PLAN is the seed for the eventual `SKILL.md` + reference docs. When the skill is built (any phase), this PLAN becomes the design rationale that the skill body executes.
>
> **Context · why this skill exists**: the EPDS (Evidence Poet Design System) has 3 functional pieces — **spec** (design.md), **distribution** (2-skill ecosystem: installer + builder), and **verification** (this auditor, queued). Without auditor, the spec begins decaying the moment any consumer translates it. `sync-tokens.mjs` already does ~30% of this for color tokens in 4 known files — the auditor is the generalization to all check dimensions × all surface types × all artifacts.

---

## 1 · What "audit" really means (12 check dimensions)

The 1-line claim "mechanically check against spec" hides at least 12 distinct check dimensions. Each is a separate verifier with its own rule source and detection strategy.

| # | Check dimension | Spec source | Detection | Surface applicability |
|---|---|---|---|---|
| 1 | **Token literal · color** — hex/rgba/hsl values that should resolve to canonical | design.md §0 JSON color block | Parse CSS/JSX/HTML/SVG for hex literals; compare set | All 4 surfaces |
| 2 | **Token reference · CSS var** — `var(--color-*)` calls reference defined tokens | theme-dna1.css | Parse `var()` calls; check against defined custom properties | React + Vanilla |
| 3a | **Spacing · scale adherence** — px/em values should be on 4px-rooted scale | design.md §5 spacing scale | Parse padding/margin/gap/width/height; check against scale [4,8,12,16,20,24,32,40,48,64,80,120] | All 4 surfaces |
| 3b | **Spacing · pair rhythm consistency** — same element-pair (e.g. `h2 → p`, `card → card`, `section → section`) should use the SAME gap across the whole artifact, not 16px in one place and 24px in another | design.md §5 spacing scale + implicit rhythm convention | Static + DOM walk: collect all `(parentTag, childTag, gapValue)` triples · cluster by pair · if any pair has >1 distinct gap value across the doc, flag the outliers (smaller cluster = drift candidate) | All 4 surfaces |
| 3c | **Spacing · visual density (breathing room)** — even when every value is on scale + every pair is consistent, the rendered layout may still be too crowded (all values clustered at 4-8px end of scale) | Runtime measurement against per-surface density floor (e.g. min-gap ≥ 12px for body text · min-gap ≥ 24px between sections) | **Runtime** — headless Chromium render · for each visible element pair, measure rendered `getBoundingClientRect` distance · flag pairs below density-floor threshold defined per surface profile (Display: dense ok; Diagram: sparse required; Review HTML: medium; Data-heavy: dense ok in table cells but sparse between sections) | All 4 surfaces (runtime) |
| 4 | **Font family** — only 3 canonical fonts | design.md §3 font stack | Parse `font-family` declarations; check against {Playfair Display, Plus Jakarta Sans, DM Mono} | All 4 surfaces |
| 5 | **Type role usage** — Guardrail B: serif heading-only, sans body-only, mono labels/nav/CTA only | design.md §9-B + §3 hierarchy | **Hard** — needs CSS selector → HTML semantic mapping. Parse selectors (e.g., `h1 { font-family: var(--font-sans) }` = violation: serif heading rule). Best-effort static analysis. | All 4 surfaces |
| 6 | **Border-radius** — Guardrail A: 0 globally | design.md §9-A + §6 | Parse `border-radius` declarations; any non-zero = violation | All 4 surfaces |
| 7 | **Color discipline** — Guardrail C: never gold as text, never sub-#717171 grays for body | design.md §9-C | Parse text-bearing selectors; check color value against forbidden set | All 4 surfaces |
| 8 | **Motion/easing** — Guardrail D: only `cubic-bezier(0.16, 1, 0.3, 1)` | design.md §9-D + §7 | Parse `transition`/`animation` declarations; check timing-function | React (mainly) + Vanilla (rarely) |
| 9 | **Shadow** — hover/active state only, not default | design.md §7 + §9-A | Parse `box-shadow` declarations; check selector context (`:hover` / `.active` / similar) | React + Vanilla |
| 10 | **Cross-surface consistency** — same spec, multiple consumers, all in sync | sync-tokens.mjs current scope | Compare token values across all known consumer files | All 4 surfaces (this subsumes current sync-tokens.mjs) |
| 11 | **WCAG contrast** — text-on-bg combos ≥ 4.5:1 (normal) or 3:1 (large/non-text) | design.md §2 contrast table + §9-C | For each text+bg pair: compute ratio; flag failing | All 4 surfaces |
| 12 | **Extension governance** — `--review-*` / `--severity-*` / `--<consumer>-*` namespace rules + WCAG rationale comment requirement | design.md §"Extension governance" | Parse extension custom-property definitions; check naming + comment presence | Consumer-specific (review HTML, etc.) |

**Each dimension is a separate check function.** Implementing 1 = MVP (Phase 1 below). Implementing 12 (now 14 with 3 split into 3a/3b/3c) = mature auditor (Phase 5+).

**Why split #3**: spacing has 3 distinct failure modes that need different detection methods:
- **3a value drift** (`padding: 13px`) — purely lexical · parse + compare to scale · cheap
- **3b rhythm drift** (h2→p is sometimes 16, sometimes 24) — needs whole-doc pair collection + cluster · still static but doc-scoped not file-scoped · medium cost
- **3c density drift** (everything technically on scale but rendered layout is suffocating) — needs runtime render · expensive · profile-dependent thresholds

A pure 3a-only check would pass artifacts that fail 3b (inconsistent rhythm) or 3c (cramped). User can pass 3a/3b and still produce something that reads as crowded — 3c is the only check that protects the actual visual outcome.

---

## 1.5 · Dimension applicability layer (Universal · Surface-modulated · Surface-specific)

The flat dimensions table above hides a 3-layer structure. Each dimension belongs to exactly one layer, and the auditor runs them in order: Layer 1 → Layer 2 → Layer 3.

### Layer 1 · Universal (apply to ALL surfaces, same rule, same threshold)

Independent of surface type. The auditor always runs these regardless of what kind of artifact is being checked.

- **#1** Hex literal canonical (canonical palette is universal · same hex set for everyone)
- **#4** Font family (3 canonical only · universal)
- **#6** Border-radius (Guardrail A · must be 0 globally · universal)
- **#7** Color discipline (Guardrail C · no gold-as-text · no sub-#717171 for body · universal)
- **#8** Motion easing (Guardrail D · single canonical cubic-bezier · universal)
- **#9** Shadow (hover-only · universal pattern)

### Layer 2 · Surface-modulated (same check logic, threshold/interpretation varies per surface)

The check is the same algorithm, but the per-surface profile supplies the actual threshold or semantic mapping.

| Dimension | What varies per surface |
|---|---|
| **#3a** Spacing scale | universal scale [4,8,12,16,...] is shared · no variation (could also be Layer 1) |
| **#3b** Pair rhythm | which element-pairs must stay consistent depends on surface conventions (e.g. Review HTML strict on `section-pair` gap; Display loose on `card → card`) |
| **#3c** Density floor | Display: dense ok · Diagram: sparse required (≥40px between nodes) · Review HTML: medium · Data-heavy: dense ok in table cells · sparse between sections |
| **#5** Type role usage | semantic mapping varies (React `<h1>` ≠ Review HTML `.section-pair__head` even though both are "heading role") |
| **#11** WCAG contrast | size thresholds vary (Data-heavy table-cell text is often smaller → stricter ratio required) |

### Layer 3 · Surface-specific (ruleset comes entirely from surface profile)

The dimension applies only when a known surface profile is active. The profile defines the ruleset.

- **#10** Cross-surface consistency (this dimension itself is cross-cutting; runs over ALL surfaces' outputs together · not bound to a single surface)
- **#12** Extension governance — each surface has its own extension namespace + rules:

| Surface | Extension namespace | Required pattern | Forbidden |
|---|---|---|---|
| **1 Display (React)** | `--dna1-<component>-*` CSS vars | extension MUST reference root tokens, never literal hex | bare hex in `style={}` or className-scoped CSS · CSS var that doesn't trace to a root token |
| **2 Diagram (SVG)** | inline attrs only · no `<style>` block | `fill`/`stroke` from canonical palette · `stroke-width` from `accentLineWidth` · text from canonical font family | inline `<style>` · external CSS · non-canonical fill/stroke |
| **3 Review HTML** | `--review-bg-*` (warm status) · `--severity-*` (grayscale) · `--layer-*` (cool) | 9-color orthogonal tag system (3 status × 3 layer × 3 severity) · WCAG ratio comment required on each new `--color-*` extension | reusing same color across orthogonal axes · extension without WCAG comment |
| **4 Data-heavy** | `STATUS_OPTIONS_*` JS const · `--status-*` CSS vars | status badges from declared option set · sticky-left columns follow `.sticky-left-N` class · action dropdowns from `ACTIONS_*` const | ad-hoc status strings not in `STATUS_OPTIONS_*` · sticky cols without `.sticky-left-*` class |

**Implementation**: Layer 3 is data-driven by surface profile JSON files. Adding a new surface type = adding a new profile file, not editing the auditor's code.

---

## 2 · Surface-type adapters (4 surface types × different parsers)

Each Surface type needs a different file-discovery + parser:

| Surface | File types | Parser | Special considerations |
|---|---|---|---|
| **1 Display** (React) | `.tsx`, `.css`, `.ts` | TS/CSS AST · JSX walk | Identify CSS-in-JS vs separate CSS · handle CSS-modules + custom-properties |
| **2 Diagram** (SVG) | `.svg`, `.tsx` (inline SVG) | XML AST · inspect `fill` / `stroke` / `font-family` / `font-size` attributes | Inline SVG in TSX needs JSX-aware parsing |
| **3 Review HTML** (single-file HTML) | `.html` | HTML AST + inline `<style>` block parsing | Look for `.en-ref` if portfolio-case-study profile · check tag-color uniqueness per axis |
| **4 Data-heavy** (single-file HTML/CSS/JS) | `.html` | HTML AST + inline `<style>` + inline `<script>` | Distinguish `<style>` and inline `style` attribute |

**Tradeoff · static vs runtime**:
- **Static parse** (cheap, fast): tokens, font-families, border-radius. Good for Dimensions 1-9.
- **Runtime render in headless browser** (slow, accurate): computed contrast (Dimension 11). Headless Chromium + CSS computed-styles API.
- **Hybrid recommended**: static for cheap dimensions, opt-in runtime for contrast.

---

## 2.5 · Surface profile system + handling unknown surfaces

### Surface profile as 1st-class object

Each known surface type has a profile JSON file declaring everything the auditor needs:

```json
// surface-profiles/review-html.json
{
  "name": "review-html",
  "detect": {
    "filePattern": ["**/_review/*.html", "**/review_html/*.html"],
    "contentSniff": ["section-pair", ".en-ref", "BUILD INVARIANTS"]
  },
  "extensions": {
    "allowedNamespaces": ["--review-bg-", "--severity-", "--layer-", "--tag-"],
    "requireComment": "WCAG \\d\\.\\d{1,2}:1",
    "tagOrthogonality": {
      "axes": ["status", "layer", "severity"],
      "uniquePerAxis": true,
      "totalUniqueColors": 9
    }
  },
  "thresholds": {
    "densityFloor": { "sectionPairGap": 24, "bodyTextGap": 12 },
    "rhythmStrict": ["section-pair > section-pair", "card-box > card-box"]
  },
  "typeRoleMapping": {
    ".section-pair__head": "heading",
    ".section-pair__body": "body",
    ".card-box__label": "label"
  }
}
```

**Adding a new surface type** = creating a new profile JSON file. Auditor reads `surface-profiles/*.json` at startup, registers all profiles, runs detection at audit time.

### Audit flow with surface detection

```
1. Detect surface type
   ├─ for each profile in surface-profiles/:
   │    if filePattern matches AND contentSniff matches → candidate
   ├─ if 1 candidate: use it
   ├─ if multiple candidates: highest confidence (most sniff hits)
   └─ if 0 candidates: → fallback (see below)

2. Run Layer 1 universal dimensions
3. Run Layer 2 surface-modulated dimensions (using detected profile's thresholds)
4. Run Layer 3 surface-specific dimensions (using detected profile's ruleset)
5. Report (with detected surface noted in header)
```

### Unknown surface · 4 fallback modes

When detection returns 0 candidates:

| Mode | Flag | Behavior | When to use |
|---|---|---|---|
| **(a) Universal-only** · default | (none) | Run Layer 1 only (6 dimensions) · skip Layer 2/3 · report: `"⚠ surface type unknown · ran 6/14 dimensions"` | Safe conservative default · single-file ad-hoc check |
| **(b) Strict** | `--strict-unknown` | Run Layer 1 + Layer 2 with medium-threshold defaults · Layer 3 flags ANY extension as drift | CI gate · prevent novel surface from sneaking by |
| **(c) Auto-classify** | `--auto-classify` | Score against all known profiles by content sniff hits · pick closest with confidence % · proceed with full audit · report classification in header | Best-effort for artifacts that resemble known surfaces but don't match detect rules |
| **(d) Define new profile** | `--define-profile=<name>` | Interactive prompt: walk user through declaring filePattern + namespaces + thresholds · write new `surface-profiles/<name>.json` · re-run audit | Genuine 5th surface type emerges · one-time setup cost · all future audits get it free |

**Default behavior is (a)**: never block on unknown · always report what was checked vs skipped. Strictness opt-in.

### Why this matters

Without explicit profile system, the auditor either:
- (a) Bakes 4 surface types into code → adding 5th surface = code change in 4-6 places
- (b) Runs everything in strict mode by default → noisy false-positives on legitimate extensions
- (c) Skips extension checks entirely → loses 1/3 of its value

Profile-as-data + explicit fallback modes is the only architecture that scales past 4 surfaces.

---

## 3 · Output format (severity-tagged report)

Mirrors the `review_html_workflow.md` Severity scheme already in use:

| Severity | Meaning | Examples |
|---|---|---|
| **P0** · 必须修 | Brand-breaking drift · spec rule violation · WCAG fail | Hex literal not in canonical · Gold as text · contrast < 4.5:1 |
| **P1** · 应修 | Should fix · pattern drift · ambiguous compliance | Non-canonical spacing value · Type role unclear (selector matches both heading + body) |
| **P2** · 注 | Suggest only · style preference · borderline | Extension token without WCAG comment · auto-suggest format |

**Output channels**:
1. **Terminal (default)** · human-readable colored output · file:line:col + violation + fix suggestion
2. **JSON** (`--format=json`) · for tooling integration · structured by Surface + Dimension + Severity
3. **Review HTML** (`--format=html`) · uses the EP review HTML pattern itself · self-circular meta · auditor reports drift in the same visual language as the system being audited
4. **Exit code** · 0 = pass · 1 = any P0/P1 · 2 = parse error

---

## 4 · Knowledge sources the auditor needs

- `portfolio/style/design.md` §0 JSON (canonical token values · machine-readable)
- `portfolio/style/design.md` §3 typography hierarchy (role → font mapping)
- `portfolio/style/design.md` §4 component patterns (specific values for known components)
- `portfolio/style/design.md` §5 spacing scale
- `portfolio/style/design.md` §9 guardrails A-D (rules)
- `portfolio/style/design.md` §10 responsive (breakpoints, touch targets)
- `portfolio/style/design.md` §"Extension governance" (rule 5)
- `theme-dna1.css` (CSS var definitions · what's defined vs undefined)

**Auditor loads spec once at startup** (no per-file re-parse).

---

## 5 · Execution model

**CLI invocation**:
```bash
evidence-poet-auditor <path>                    # default: all checks, terminal output
evidence-poet-auditor <path> --strict            # exit 1 on any P1+
evidence-poet-auditor <path> --surface react     # only React-applicable checks
evidence-poet-auditor <path> --format=html       # review-HTML output
evidence-poet-auditor <path> --runtime           # enable browser-render checks (Dimension 11)
evidence-poet-auditor <path> --fix               # auto-fix trivial drifts (hex literals only)
```

**Skill invocation** (Claude Code skill):
- User says "audit this against EP spec" / "/audit-ep" / "check this for DNA1 drift"
- Skill `cd`s into project, runs the script, returns formatted report
- Suggests fixes via Edit tool if `--fix` mode

**Self-contained · 0 npm dependencies**: target ~50-100 LOC for Phase 1, ~500 LOC at full maturity. Uses Node.js stdlib only.

---

## 6 · 8-phase implementation roadmap

| Phase | Scope | LOC budget | Effort | Trigger |
|---|---|---|---|---|
| **1 · MVP · Token literal · color** | Layer 1 only · detect hex literals not in design.md §0 canonical set · terminal output · all file types · NO surface detection yet (runs flat) | ~50-100 | 1-2h | ✅ **SHIPPED 2026-05-25** |
| **1.5 · Surface profile system + detection** | Add `surface-profiles/<name>.json` system · detect step in audit flow · fallback modes (a)/(b) only · refactor Phase 1 to run as Layer 1 within new flow | +120 | 3h | Before any Layer 3 work (Phase 7 depends on this) |
| **2 · Guardrails A/C/D** (Layer 1) | Add border-radius (must be 0) · color discipline (no gold-as-text) · easing (only canonical cubic-bezier) | +100 | 2h | After Phase 1.5 lands · all 4 are Layer 1 universal |
| **3 · Spacing 3a + Font family** | Add spacing-scale check (3a · 4px-rooted) + font-family check (3 canonical fonts only) | +80 | 1.5h | Phase 2 stable |
| **3.5 · Spacing 3b · pair rhythm** | Add pair-rhythm cluster check (gather all element-pair gaps · flag pairs with >1 gap value) · still static, doc-scoped | +80 | 2h | Phase 3 stable · prove rhythm drift exists in real artifacts |
| **4 · Type role usage (semantic)** | Add Guardrail B check — hard, needs CSS-selector → HTML-element semantic mapping. Best-effort static analysis. | +200 | 3-4h | If Phase 3/3.5 catches enough drift to prove value |
| **5 · WCAG contrast + Spacing 3c density** | Add runtime contrast check + runtime density-floor check · headless Chromium shared infra · opt-in via `--runtime` flag | +200 | 4h | After Phase 4 · runtime infra justifies both checks together |
| **6 · Cross-surface consistency · subsume sync-tokens.mjs** | Generalize current sync-tokens.mjs into auditor's Dimension 10 · replace the standalone script | +50 | 1h(merge) | When auditor reaches feature parity with sync-tokens.mjs |
| **7 · Extension governance** (Layer 3) | Dimension 12 · per-surface namespace + WCAG-comment + tag-orthogonality (Review HTML) + status-option discipline (Data-heavy) + var-must-reference-root (Display) + inline-attr-only (Diagram) · uses profiles from Phase 1.5 · adds fallback (c) `--auto-classify` and (d) `--define-profile=<name>` | +180 | 4h | Once Phase 1.5 stable AND extension-token use grows |
| **8 · Output formats + skill packaging + CI** | JSON output · review-HTML output · `nightly_audit.sh` integration · package as `evidence-poet-auditor` Claude skill in claude_skills/ · publish in EP repo alongside installer + builder · 3-skill ecosystem | +100 + skill wiring | 3-4h | Phase 7 complete |

**Total at full maturity**: ~1100 LOC + skill wiring · spread across 10 phases (8 + 3.5 + 1.5 inserted). Profile JSONs are data, not LOC — adding 5th surface profile is ~50 lines of JSON, not code.

**MVP shippable in 1-2 hours**: Phase 1 alone proves the concept (hex-literal canonical check) and demonstrates the workflow.

---

## 7 · Risks and hard parts

- **Type role detection (Phase 4)** is genuinely hard. Knowing "this serif is being used as a label" needs semantic understanding of surrounding HTML/JSX. Static analysis is best-effort; some cases need runtime. May ship as warning-only initially.
- **False positives** for vendor CSS or third-party components. Need allowlist/ignore-list mechanism (`// eps-auditor-ignore-next-line` comments? `.eps-auditor-ignore` file?).
- **Performance** at scale — checking 20+ files × 12 dimensions × O(n) tokens each. Profile early; cache spec parsing.
- **Extension governance ambiguity** — distinguishing "legitimate extension" from "drift" requires reading rules (judgment). Some cases will require human review even after auditor passes.
- **Maintenance burden** — auditor must stay in sync with design.md updates. If spec changes a token's canonical value, auditor's canonical set must update. Solution: auditor reads design.md §0 JSON at runtime, not bakes values into script.

---

## 8 · What's NOT in scope (deliberately)

- ❌ **Re-implementing design.md content** — auditor reads spec, doesn't define it
- ❌ **General accessibility audit beyond WCAG contrast** — auditor focuses on design-system-specific rules (Guardrails A-D + tokens); broader a11y is a separate concern
- ❌ **Build pipeline integration** — auditor is the check, not the build system; can be called by CI but isn't CI itself
- ❌ **Auto-rewrites of judgment-heavy violations** — only Phase 1 auto-fix is hex literals (deterministic mapping). Type-role reverses, motion overshoots, etc. = report only, no auto-fix
- ❌ **Cross-spec audit (audit multiple design systems)** — single-spec scope; if user adopts another design system, that's a different auditor instance

---

## 9 · Integration with existing tools

**Subsumes**:
- A pre-existing project-local `sync-tokens.mjs` script (typically ~250 LOC · checks N specific consumer files for color drift) is subsumed by Phase 6 Dimension 10 (cross-surface consistency · multi-consumer aggregator)

**Invoked by**:
- `evidence-poet-builder` skill — at end of build, runs auditor on the new artifact, shows drift before declaring done
- `visual-asset-generator` skill — same · runs auditor on generated SVG before output
- `nightly_audit.sh` — adds Section 10 "EP design system drift check" once Phase 8 ships

**Distinct from**:
- `evidence-poet-installer` skill — installer copies spec, doesn't verify; auditor verifies, doesn't install
- `evidence-poet-builder` skill — builder generates, auditor verifies; builder uses anti-patterns to prevent at build-time, auditor catches at post-build-time

---

## 10 · Lesson · why this PLAN exists

The v3 EP case study contained this line about the auditor:
> "a self-contained ~50-line script that mechanically checks any surface artifact (Display, Diagram, Review HTML, Data-heavy) against the spec and reports violations."

User push-back was correct: that framing is **the MVP (Phase 1 only)**, not the full system. A real auditor has 12 check dimensions × 4 surface adapters × static+runtime hybrid · subsumes sync-tokens.mjs · runs as a Claude skill + CLI + CI exit-code · uses the EP review HTML pattern as one of its own output formats. Calling it "~50 lines" understates by ~700 LOC at full maturity.

**For case study honesty**: the v3 §7 reflection should describe auditor as "Phase 1 MVP is ~50 LOC and demonstrates the principle; full system is ~800 LOC across 8 phases." Or just point at this PLAN.

This PLAN file serves as both:
1. The technical blueprint for when the skill is built.
2. The honest scoping context that prevents the case study from understating what's required.
