---
name: evidence-poet-review
description: Render a document or codebase change-set into a DNA1 ("Evidence Poet") styled review HTML — content side-by-side with rationale annotations, per-section feedback collector, two layout archetypes (right-rail · stacked), two tag profiles (editorial · technical), DIFF mode for incremental re-reviews. Use when you need a visual, scrollable, side-by-side review surface for a doc / spec / code change / design proposal. Triggers on "render this as a review HTML", "build a DNA1 review for X", "用 DNA1 出 review", "review this doc in HTML", "/review-dna1". The review-HTML production engine of the Evidence Poet system — equivalent to evidence-poet-diagram for the SVG surface. Distinct from evidence-poet-builder (which describes Scenario D at one-paragraph depth and defers here), evidence-poet-installer (which only copies the spec), and evidence-poet-auditor (which verifies post-build). Do NOT trigger for general design feedback, for rewriting prose without a visual review surface, or for installing the spec.
---

# evidence-poet-review

The content-review-HTML production engine for the DNA1 ("Evidence Poet") design
language. When you need to turn a document, a spec, a code change, or a design
proposal into a **side-by-side review surface** — content on one side, AI rationale
annotations on the other, per-section feedback the reader can collect with one
click — in DNA1, this skill gives you the canonical tokens, the two layout
archetypes, the two tag profiles, the DIFF mode for incremental re-reviews, and a
double-clickable example to copy from.

DNA1's character, in one line: *academic journal × architecture magazine — mono labels
for information order, serif headlines for narrative weight, gold lines for moments worth
pausing. Restrained, rational, never cold.*

---

## Where this fits in the Evidence Poet system

| Skill | Role |
|---|---|
| `evidence-poet-installer` | **setup** — copies the DNA1 spec into a project's `.claude/design.md` + registers a CLAUDE.md directive |
| `evidence-poet-builder` | **apply (generalist)** — the builder's guide across four surfaces (narrative · data-dense · diagram · content-review). For standalone SVG diagrams it defers to `evidence-poet-diagram`; for content-review HTML it **defers to this skill**. |
| `evidence-poet-diagram` | **apply (diagram specialist)** — the production engine behind the builder's diagram surface |
| **`evidence-poet-review`** (this skill) | **apply (review-HTML specialist)** — the production engine behind the builder's content-review surface: tokens · archetypes · tag profiles · DIFF mode · feedback collector |
| `evidence-poet-auditor` | **verify** — its `review-html` surface profile audits artifacts produced by this skill |

`diagram` and `review` sit on the same axis — depth-specialists for one surface each. The
builder Scenario D gives a paragraph-level overview; this skill is the depth.

---

## When to run

Trigger on explicit intent to produce a content-review HTML:

- "render this doc as a review HTML"
- "build a DNA1 review HTML for [spec / case study / PR / blog draft]"
- "用 DNA1 出 review · review 这篇 [文档名]"
- "review this in HTML · side-by-side with annotations"
- "/review-dna1"

Do **not** trigger for:
- General design critique or prose feedback (just answer in chat)
- Rewriting a document without producing a visual review surface
- SVG diagrams → `evidence-poet-diagram`
- Non-review React components or pages → `evidence-poet-builder`
- Installing the spec → `evidence-poet-installer`
- Auditing an existing artifact → `evidence-poet-auditor`

---

## Reference files (read BEFORE generating — mandatory)

- **`references/dna1-spec.md`** — the canonical DNA1 token spec (§0 JSON
  machine-readable + §1+ semantics). **Single source of truth for every base
  color / font / spacing value.**
- **`references/tokens.css`** — DNA1 base tokens + review-semantic extensions
  (`--review-*`, `--audit-*`) + the YaHei-first font stacks (`--font-sans/serif/mono`).
  **Copy verbatim into your review HTML** (or `<link>` reference it).
- **`references/components.css`** — all CSS rules for review-HTML components:
  both layout archetypes (`.toc-layout` / `.section-pair` / `.rationale`),
  status / layer / severity tags (both Profile A and Profile B), `.r-compare`
  before/after blocks, `.audit-box`, `.user-feedback`, `.summary-block`,
  `.diagram-backlog-box`. Depends on `tokens.css`.
- **`references/feedback-collector.js`** — self-contained IIFE that adds the
  fixed "📋 Copy all feedback" button. Serializes every `.user-feedback` block
  (section label + checked ratings + notes + summary tally) to the clipboard.
  **The page saves no data.**
- **`references/example.html`** — double-clickable demo showing **both** layout
  archetypes (A right-rail + B stacked) on one page with the live copy button.
- **`references/tag-profiles.md`** — Profile A (editorial · 3 status × 4 layer)
  vs Profile B (technical · 3 axes × 3 variants). Decision rules, CSS class
  conventions, full WCAG rationales.
- **`references/review-roles.md`** — multi-layer review architecture: Layer 0
  baseline (always on) + Layer 1+ role-specific layers (HM scan, spec-rootedness
  auditor, body↔caption checker, etc.). How to add a new role/profile.
- **`references/diff-mode.md`** — incremental re-review mode: section-level
  state tags, changed/unchanged visual treatment, source-of-diff strategy.

---

## Workflow

### Step 1 · Read the spec + tokens

Read `references/dna1-spec.md` (base DNA1 — color / type / spacing / Guardrails A–D) and
`references/tokens.css` (the review-extension layer). Lock these four before writing any HTML:

- **`<html lang="zh-Hans-CN">`** — **NOT `zh-CN`**. The `Hans` script subtag forces Simplified
  rendering. Without it, Windows renders Han-unified codepoints as **Traditional glyphs**. This
  is a recurring failure mode — see `references/dna1-spec.md` §3 "CJK / i18n font fallback".
- **CJK font stacks · YaHei first** — the `--font-sans/serif/mono` stacks in `tokens.css`
  already have `Microsoft YaHei` placed first among CJK fallbacks. **Never declare a per-rule
  font literal** — reference `var(--font-*)` everywhere. The single source can't re-diverge.
- **`borderRadius: 0` globally** — sharp corners. The global reset `*, *::before, *::after
  { border-radius: 0 }` in `components.css` enforces it.
- **3 fonts only** — Playfair Display (serif headlines) · Plus Jakarta Sans (sans body) ·
  DM Mono (labels / tags / CTA).

### Step 2 · Ask ONE bootstrap question (what + how long)

> Restructured pattern mirrors `evidence-poet-builder` Step 2: ask once, infer the rest.

**Ask the user (in plain CN/EN):**

> 你要 review 什么? 简单说一下:
>
> - **文档类型** —— case study / spec / code / blog draft / proposal / 其他
> - **大概多长** —— 1-2 节 (短) · 3-10 节 (中) · 10+ 节 (长技术)

**Infer archetype + tag profile from the answer**:

| Doc shape | Archetype default | Tag profile default | If ambiguous, ask: |
|---|---|---|---|
| Case study · doc revision · blog · biweekly · narrative | **A · right-rail** | **A · editorial** (Status × Layer) | "annotations beside content or under content?" |
| Spec · code · architecture · cross-layer audit | **B · stacked** | **B · technical** (Status × Layer × Severity) | "few findings per section or many?" |
| Short doc (≤3 sections) | A | (matches content type) | — |
| Long technical (10+ sections) | B | B technical | "any editorial sections to mix in?" |

**Only ask follow-up if the inferred default is wrong** for the user's actual content.

### Step 3 · Read the relevant profile + role doc

- For tag profile: `references/tag-profiles.md` §"Profile A" or §"Profile B" (CSS classes + rationales).
- For review roles (what to look for): `references/review-roles.md` Layer 0 baseline + the
  Layer 1+ role table. Pick a role (or two) that matches the doc type.

### Step 4 · Layout · pick the archetype

Both archetypes share the same outer frame (`.toc-layout` + `.toc-nav` left ToC + middle content +
per-section `.user-feedback`). The **only** difference is annotation placement:

| Archetype | Annotations | Per-section feedback sits | Frame class |
|---|---|---|---|
| **A · right-rail** | sticky `.rationale` rail beside the content (`.section-pair`) | at the bottom of the **rail** | `.toc-layout--rail` |
| **B · stacked** | inline `.rationale` / `.r-item` blocks under the content (`position: static`) | at the bottom of the **stack** | `.toc-layout--stacked` |

**One archetype per review HTML** — don't mix. The `example.html` shows both on one page only
to make the difference visible.

### Step 5 · Build · copy patterns from `example.html`

`references/example.html` is double-clickable and uses **only** the classes defined in
`tokens.css` + `components.css`. Copy the structure:

1. `<html lang="zh-Hans-CN">` + Google Fonts preconnect + the three font families
2. `<link rel="stylesheet" href="./tokens.css">` + `./components.css`
3. `<div class="toc-layout toc-layout--rail">` (or `--stacked`)
4. `<nav class="toc-nav">` with `<a href="#section-id">` anchors
5. `<main class="toc-layout__main">` with one `.section-pair` (A) or `.section` (B) per source
   section
6. Each section gets its annotations + a `.user-feedback` block at the bottom of the annotations
7. `<script src="./feedback-collector.js">` right before `</body>`

For an absolutely self-contained single file (no relative CSS / JS paths), inline
`tokens.css` + `components.css` into a `<style>` block and inline the `feedback-collector.js`
IIFE into a `<script>` block. The pattern is identical.

### Step 6 · Tag · pick + apply

Per `tag-profiles.md`:

- **Profile A · editorial**: every annotation carries 1 status (`.change-tag.改/kept/del`) + 1
  layer (`.r-tag.layer-a/b/c/d`). Plus the audit-box severity gradient (informational, not a
  tag axis).
- **Profile B · technical**: every finding carries up to 3 tags — `.tech-tag.tech-status-*` +
  `.tech-tag.tech-layer-*` + `.tech-tag.tech-sev-*` (P0/P1/P2 grayscale severity).

### Step 7 · Severity discipline (Profile B · also Layer 0 baseline severity)

Every finding gets P0 / P1 / P2:

| Tag | Meaning | Example |
|---|---|---|
| 🔴 **P0** | must address — factual error · broken reference · invariant violated | header says v0.2 but Version section is v0.3 |
| 🟡 **P1** | should address — ambiguity · candidate trim · cross-doc consistency | Related-BPs link points to a non-existent file |
| ⚪ **P2** | note — style · redundancy · nice-to-have | same number stated twice across sections |

For candidate rewrites, use the `.r-compare` before/after block so the reader can judge
yes/no at a glance. The annotation rail **does not rewrite the document** — it says "I noticed
X · I suggest Y · you decide."

### Step 8 · DIFF mode (incremental re-review)

If this is a re-review of a doc that was already reviewed once and edited since: read
`references/diff-mode.md`. Apply the 4 mechanisms (section-level state tag, changed-section
gold tint + changebar, unchanged-section fold + 50% opacity, rail-trim). Name the file
`<doc-stem>_review_v<N>.html` (don't overwrite v<N-1>) and put `(post-v<N-1>-fix · DIFF mode)`
in the meta-bar.

### Step 9 · Post-build verification · handoff to auditor

After the build is done, run the auditor's `review-html` profile for objective verification:

```bash
node ~/.claude/skills/evidence-poet-auditor/audit.mjs <path-to-your-review.html> \
  --spec=<path-to-design.md> --surface=review-html
```

Auditor exit codes: `0` pass · `1` P1 only · `2` setup error · `3` P0 violations. Fix and re-run.

---

## Output

- A single `.html` file. Self-contained (inline CSS + JS) **or** linked to sibling
  `tokens.css` + `components.css` + `feedback-collector.js`. Both work. Pick based on whether
  the reviewer needs to double-click open vs serve from a folder.
- Suggested location: `_review/<doc-stem>_review_v1.html` co-located with the source document
  (so source + review live together; relative-path images in the source still resolve).
- Naming: `<doc-stem>_review_v<N>.html`. Re-reviews bump N — never overwrite v<N-1>.
- Report the path back to the user.

---

## What this skill does NOT do

- Does not install the spec into a project → `evidence-poet-installer`
- Does not edit the source document being reviewed (the rail proposes; the human decides; the
  edit is a separate step)
- Does not run package managers, build, or deploy
- Does not save user feedback (the page is ephemeral — the collector serializes to clipboard
  on demand · no localStorage · no backend)
- Does not audit its own output → run `evidence-poet-auditor --surface=review-html`

---

## Reference · short form

Skim order when shipping:

1. `dna1-spec.md` — base tokens · §9 Guardrails non-negotiable
2. `tokens.css` — review extensions · font stacks · YaHei discipline
3. `tag-profiles.md` — pick Profile A or B before laying out
4. `review-roles.md` — pick a role (or two) so the annotations have a lens
5. `example.html` — copy the structure
6. `components.css` — class reference while building
7. `diff-mode.md` — only for re-reviews
8. `feedback-collector.js` — drop in as-is
