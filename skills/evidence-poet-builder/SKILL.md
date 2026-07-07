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
- Generating SVG diagrams as a one-off → use `svg-diagram-skill` (it already encodes DNA1)
- Non-visual work

---

## Workflow

### Step 1 · Read the spec

Read `references/spec.md` — the canonical DNA1 token source (framework-agnostic ·
§0 JSON machine-readable + §1+ semantics). Lock these four before writing any code:

- **`borderRadius: 0` globally** — sharp corners are a DNA1 signature. Never round a corner.
  **Write the literal `border-radius: 0` (or omit it entirely) — do NOT create a `--radius`
  token. Even `--radius: 0` + `border-radius: var(--radius)` reads as *parameterized* rounding
  and fails Guardrail A (the indirection defeats the static "always 0" guarantee).**
- **3 fonts only** — Playfair Display (serif headlines) · Plus Jakarta Sans (sans body) ·
  DM Mono (labels / nav / CTA). Roles never reverse.
- **Color palette + WCAG floors** — gold `#C8A84B` is an accent (lines only · never text).
  **Don't eyeball a muted gray — use a WCAG-verified text/bg PAIR, because a gray that passes
  on paper can fail on a slightly darker fill:** `#717171` is the floor **only on warm paper
  `#F8F7F3` (4.55:1 ✓)**; on a surface fill like `#f5f5f3` it drops to **4.47:1 ✗**. For muted
  text on any non-paper fill (surface `#f5f5f3` · hover `#eeedea` · a pill/chip bg), darken the
  text (e.g. ink `#1A1A18`, or a darker gray) or keep the fill at paper — then **confirm with
  the auditor's dim #11 (WCAG contrast)**. Reasoning about contrast in a comment is not enough;
  ship the tested pair.
- **0 emoji icons** — use CSS swatches + text labels for status. User-strict.

### Step 2 · Ask ONE bootstrap question (content shape) · infer the rest

> Restructured 2026-05-26 per builder skill review §1 P2 — Q1 (framework) and Q3 (content shape) were redundant · content shape determines framework 90% of the time. Ask content first · infer framework · only follow-up if inferred default is wrong for user's context.

**Ask the user (in plain CN/EN):**

> 你要构建什么? 选一个:
>
> - **Narrative / story page** — hero · about · blog post · case study · portfolio card
> - **Data-dense surface** — table · list · multi-tab nav · sortable/filterable rows · status signals
> - **Diagram** — architecture chart · flow chart · decision matrix · concept-framework figure
> - **Content-review HTML** — proposed changes + rationale annotations side-by-side · doc revision · technical audit
> - **Hybrid / something else** — describe what

**Infer framework + host from content shape**:

| Content shape | Framework default | Host default | If ambiguous, ask: |
|---|---|---|---|
| Narrative | React/TSX | in-app or own host | "in-app integration OR standalone host?" |
| Data-dense | vanilla HTML/CSS/JS | static file or own host | "is this inside an existing React app?" (if yes → Scenario A+B hybrid) |
| Diagram | SVG | embedded asset | "standalone SVG file or embedded in larger build?" (if standalone → suggest `svg-diagram-skill` instead) |
| Content-review | vanilla HTML (or React) | static file most common | "static file OR inside a React app?" |
| Hybrid | depends — read 2 closest scenarios + merge | — | "what's the primary use case?" |

**Only ask follow-up framework / host question if the inferred default is wrong for user's actual context.** Don't volunteer 3 questions when 1 will do.

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

### Step 7 · Post-build verification · handoff to auditor (added 2026-05-26 per §1 P1)

After the build is done and the self-check (`anti-patterns.md` 13-item list) passes, **run the auditor for objective verification**:

```bash
node ~/.claude/skills/evidence-poet-auditor/audit.mjs <path-to-your-build>
```

Auditor exit codes:
- `0` — pass (no P0/P1 violations)
- `1` — fix P0/P1 violations and re-run
- `2` — setup error (spec missing, bad args)

**This completes the spec + distribution + verification triad**: spec lives in `spec.md` (canonical) · this builder skill is distribution (apply-time, BP-aware) · auditor is verification (post-build, spec-only). Without Step 7, builder declarations of "done" are unverified.

---

## Reference files

- **`references/spec.md`** — canonical DNA1 token spec. §0 JSON (machine-readable) ·
  §1–11 color / type / components / layout / motion / guardrails / agent prompt guide.
- **`references/application-scenarios.md`** — the four consumer scenarios, each with its
  reference implementation, when-to-use criteria, reusable patterns, and a vanilla↔React
  translation guide.
- **`references/anti-patterns.md`** — DNA1 guardrail violations + user-strict rules +
  extension governance. Read before writing code.

---

## What this skill does NOT do

- Does not install the spec into a project → `evidence-poet-installer`
- Does not generate SVG diagrams as a finished deliverable → `svg-diagram-skill`
- Does not refactor existing non-DNA1 code to comply
- Does not run package managers, build, or deploy
- Does not make product / content decisions — only how to render them in DNA1
