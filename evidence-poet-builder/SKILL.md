---
name: evidence-poet-builder
description: Build something new in the DNA1 ("Evidence Poet") design language — a React component or page, a vanilla HTML/CSS/JS tool, an SVG diagram, or a content-review HTML. Use when starting fresh frontend or visual work that should follow DNA1. Triggers on "build X in DNA1", "用 DNA1 建", "make a DNA1-styled component/page/tool", "new DNA1 product", "/build-dna1". Provides the canonical token spec, three bootstrap questions to pick the right reference implementation, application patterns across four consumer scenarios, and the anti-pattern list. Distinct from evidence-poet-installer, which only installs the spec into a project — this skill is the builder's guide for actually constructing DNA1-compliant artifacts. Do NOT trigger for general frontend questions, design feedback, or merely installing the spec.
---

# evidence-poet-builder

The builder's guide for the DNA1 ("Evidence Poet") design language. When you need to
construct something new — a React component, a vanilla single-file tool, an SVG diagram,
a content-review HTML — in DNA1, this skill gives you the canonical spec, the right
reference implementation to copy from, and the anti-patterns to avoid.

DNA1's character, in one line: *academic journal × architecture magazine — mono labels
for information order, serif headlines for narrative weight, gold lines for moments worth
pausing. Restrained, rational, never cold.*

---

## Two DNA1 skills · which one you want

| Skill | Role | Run |
|---|---|---|
| `evidence-poet-installer` | **Installer** — copies the spec into a project's `.claude/design.md` + registers a CLAUDE.md directive | once per project |
| **`evidence-poet-builder`** (this skill) | **Builder's guide** — given DNA1 is the target language, how to actually construct an artifact: which reference implementation to copy, which patterns apply, what not to do | every time you build |

Install first (if the project hasn't got the spec), then build. They compose.

---

## When to run

Trigger on explicit intent to build something new in DNA1:

- "build a [component / page / tool / diagram / review HTML] in DNA1"
- "用 DNA1 建一个 [...]"
- "make a DNA1-styled [...]"
- "/build-dna1"

Do **not** trigger for:
- General frontend questions ("how do I center a div")
- Design critique / feedback on existing work
- Merely installing the spec into a project → use `evidence-poet-installer`
- Generating SVG diagrams as a one-off → use `visual-asset-generator` (it already encodes DNA1)
- Non-visual work

---

## Workflow

### Step 1 · Read the spec

Read `references/dna1-spec.md` — the canonical DNA1 token source (framework-agnostic ·
§0 JSON machine-readable + §1+ semantics). Lock these four before writing any code:

- **`borderRadius: 0` globally** — sharp corners are a DNA1 signature. Never round a corner.
- **3 fonts only** — Playfair Display (serif headlines) · Plus Jakarta Sans (sans body) ·
  DM Mono (labels / nav / CTA). Roles never reverse.
- **Color palette + WCAG floors** — gold `#C8A84B` is an accent (lines only · never text) ·
  body-text grays have a contrast floor of `#717171`.
- **0 emoji icons** — use CSS swatches + text labels for status. User-strict.

### Step 2 · Ask the three bootstrap questions

The right reference implementation depends on what you are building. Ask the user:

1. **Framework?** React / TSX · vanilla HTML+CSS+JS · SVG · other
2. **Standalone or hosted?** Own host · inside an existing React app · static file opened locally
3. **Content shape?** Narrative / story · data-dense table or list · diagram · content-review · hybrid

### Step 3 · Pick the reference implementation

Read `references/application-scenarios.md` and match the answers to one of the four
consumer scenarios (React narrative · vanilla data-dense · SVG diagram · content-review
HTML). Each scenario points to a real, shipped reference implementation — copy its
patterns, do not reinvent. If the build is a hybrid, read the two closest scenarios.

### Step 4 · Honor the anti-patterns

Read `references/anti-patterns.md` before writing code. The four DNA1 guardrails (A–D)
and the user-strict rules (0 emoji · 0 rounded corners · no decorative shadows) are
non-negotiable. Most framework defaults (rounded corners, drop shadows) violate DNA1 —
override them explicitly.

### Step 5 · Propose architecture before coding

For anything beyond a single small component: propose the architecture — file structure ·
which patterns from the reference impl · the token plan — and confirm with the user
before generating code. Do not write a multi-file build on first response.

### Step 6 · Token discipline while coding

- Every color / font / spacing value comes from a token (`var(--token)` in CSS · the §0
  JSON values in vanilla / SVG). Never hardcode a literal hex / px / font-family.
- If you genuinely need a value the spec does not have, it is an **extension** — namespace
  it (`--review-*`, `--<consumer>-*`), document a WCAG rationale inline, and state its
  derivation. See `references/anti-patterns.md` §"Extension governance".

---

## Reference files

- **`references/dna1-spec.md`** — canonical DNA1 token spec. §0 JSON (machine-readable) ·
  §1–11 color / type / components / layout / motion / guardrails / agent prompt guide.
- **`references/application-scenarios.md`** — the four consumer scenarios, each with its
  reference implementation, when-to-use criteria, reusable patterns, and a vanilla↔React
  translation guide.
- **`references/anti-patterns.md`** — DNA1 guardrail violations + user-strict rules +
  extension governance. Read before writing code.

---

## What this skill does NOT do

- Does not install the spec into a project → `evidence-poet-installer`
- Does not generate SVG diagrams as a finished deliverable → `visual-asset-generator`
- Does not refactor existing non-DNA1 code to comply
- Does not run package managers, build, or deploy
- Does not make product / content decisions — only how to render them in DNA1
