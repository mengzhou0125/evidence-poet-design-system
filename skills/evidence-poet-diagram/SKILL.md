---
name: evidence-poet-diagram
description: Generate DNA1 ("Evidence Poet") styled SVG diagrams — architecture diagrams, flow charts, decision matrices, hierarchy trees, comparison figures, and concept-framework figures. Use when you need a finished, standalone vector diagram that follows the DNA1 design language. Triggers on "draw a DNA1 diagram", "用 DNA1 画架构图/流程图/决策矩阵/概念图", "make an SVG flow chart in DNA1", "/draw-dna1". This is the diagram-surface production engine of the Evidence Poet system: it carries the chart-type taxonomy (TYPE A–F), the Python list generation method, and the validation pipeline that evidence-poet-builder deliberately does not. Distinct from evidence-poet-builder (the general builder's guide, which defers standalone SVG diagrams to this skill) and evidence-poet-installer (which only installs the spec). Do NOT trigger for non-diagram frontend work, for installing the spec, or for general design questions.
---

# evidence-poet-diagram

The diagram-surface production engine for the DNA1 ("Evidence Poet") design language.
When you need a **finished, standalone SVG diagram** — an architecture chart, a flow chart,
a decision matrix, a hierarchy tree, a comparison figure, or a concept-framework figure —
in DNA1, this skill gives you the chart-type taxonomy, the generation method, and the
validation pipeline to produce one that is spec-compliant on the first pass.

DNA1's character, in one line: *academic journal × architecture magazine — mono labels for
information order, serif headlines for narrative weight, gold lines for moments worth pausing.
Restrained, rational, never cold.*

---

## Where this fits in the Evidence Poet system

The Evidence Poet design system is a lifecycle — **install → build → audit** — plus one
surface that earned a dedicated generator:

| Skill | Role |
|---|---|
| `evidence-poet-installer` | **setup** — copies the DNA1 spec into a project's `.claude/design.md` + registers a CLAUDE.md directive |
| `evidence-poet-builder` | **apply (generalist)** — the builder's guide across four surfaces (narrative · data-dense · diagram · content-review). For standalone SVG diagrams it **defers to this skill**. |
| **`evidence-poet-diagram`** (this skill) | **apply (diagram specialist)** — the production engine behind the builder's diagram surface: TYPE A–F taxonomy, Python generation, validation |
| `evidence-poet-auditor` | **verify** — audits artifacts against the spec; its **Diagram** surface profile already covers what this skill produces |

So: `builder` tells you DNA1 is the target language and which surface you're on; for the
diagram surface, **this skill is how you actually construct the artifact**; `auditor` verifies it.

---

## When to run

Trigger on explicit intent to produce a standalone DNA1 diagram:

- "draw an architecture / flow / hierarchy / matrix / comparison / concept diagram in DNA1"
- "用 DNA1 画一个 [架构图 / 流程图 / 决策矩阵 / 层级图 / 概念框架图]"
- "make a DNA1-styled SVG diagram"
- "/draw-dna1"

Do **not** trigger for:
- Non-diagram frontend work (components, pages, tools) → `evidence-poet-builder`
- Installing the spec into a project → `evidence-poet-installer`
- Auditing an existing artifact → `evidence-poet-auditor`
- General design questions or non-visual work

---

## Reference files (read BEFORE generating — mandatory)

- **`references/dna1-spec.md`** — the canonical DNA1 token spec (§0 JSON machine-readable +
  §1+ semantics). **The single source of truth for every color / font / spacing value.** Look
  tokens up here, not from the cached values in `svg-spec.md`.
- **`references/svg-spec.md`** — the SVG-specific application of those tokens: two color
  themes, the three-tier font system, geometry rules, the 5-step vertical spacing scale
  (`VS_TIGHT`/`COMPACT`/`SECTION`/`MAJOR`/`MARGIN`), the `CORE_WIDTH` canvas rule, and the
  content-driven prose-height rule.
- **`references/chart-types.md`** — the TYPE A–F decision tree and layout templates
  (Matrix / Coordinate / Flow / Hierarchy / Architecture / Comparison).
- **`references/generation-method.md`** — the Python-list generation method (mandatory; no
  bash `echo`/heredoc SVG), the two-step "describe-then-render" flow, and the validation
  pipeline including the **pre-write placeholder check**.

---

## Workflow

### Mode 1 · Diagram (the common case)

For an architecture / flow / hierarchy / matrix / comparison figure.

1. **Read** `dna1-spec.md` (tokens) + `svg-spec.md` (SVG rules) + `chart-types.md` (layout).
2. **Pick the chart type** (TYPE A–F) via the `chart-types.md` decision tree.
3. **Describe the structure in chat first** — node list, connections/relationships, canvas
   estimate, color theme, file name. Wait for the user's 👍 or adjustment.
4. **Generate** with the Python-list method (`generation-method.md`): build the body top-down
   with the `VS_*` spacing tokens, derive `CANVAS_HEIGHT` from content (never a fixed value
   bumped later), interpolate dimensions with f-strings in **both** the `<svg>` header and the
   background `<rect>`, and run the **pre-write placeholder validation** before writing.
5. **Validate** the output: XML syntax · waste-ratio < 15% · color/geometry spec compliance
   (`generation-method.md` "生成后验证").
6. **Save** the `.svg` and report the path.

### Mode 2 · Concept diagram

For a conceptual / framework figure (a red-thread arc, a knowledge-architecture map, a
positioning sketch). Same pipeline as Mode 1 — the type is usually Flow / Hierarchy /
Architecture. The only difference is the input is a described concept rather than a data
structure; the structure-description step (3) matters even more, so confirm it before drawing.

---

## Output

### Default theme

Default to the **warm-paper theme** (`#F8F7F3` canvas + gold `#C8A84B` accent). Switch to the
**monochrome** theme only when the user explicitly asks for "monochrome" / "黑白灰" / an
academic black-and-white look. Both themes are defined in `svg-spec.md` (Theme A vs Theme B).

### File naming

`<diagram-name>.svg` in kebab-case (e.g. `5d-evaluation-framework.svg`,
`request-lifecycle.svg`). For the monochrome variant, append `_mono` (e.g.
`request-lifecycle_mono.svg`). Save to wherever the caller specifies; do not invent project
paths or modify application source files — emit the `.svg` and let the caller integrate it.

---

## Post-generation · hand off to the auditor

After generating and self-checking, verify objectively with the auditor (its **Diagram**
surface profile is built for exactly this output):

```bash
node ~/.claude/skills/evidence-poet-auditor/audit.mjs <path-to-your-diagram.svg>
```

- exit `0` — pass (no P0/P1 violations)
- exit `1` — fix P0/P1 violations and re-run
- exit `2` — setup error (spec missing, bad args)

---

## Mandatory pre-generation steps (do not skip)

1. **Read the 4 reference files** (spec + svg-spec + chart-types + generation-method).
2. **Output a structure description to chat** — node list, connections, canvas estimate,
   color theme, file name.
3. **Wait for the user's confirmation** before generating.
4. **Generate + validate** (Python list method · pre-write placeholder check · syntax /
   waste-ratio / style checks).
5. **Save + report the path.**

Skipping steps 1–3 and generating directly is **explicitly forbidden** — it produces style
drift away from the DNA1 spec.

---

## What this skill does NOT do

- Does not install the spec into a project → `evidence-poet-installer`
- Does not build components / pages / tools / review HTML → `evidence-poet-builder`
- Does not audit existing artifacts → `evidence-poet-auditor`
- Does not modify application source (e.g. inject `<img>`/`<figure>` into a codebase) — it
  emits standalone `.svg` files and leaves integration to the caller
- Does not make content decisions — only how to render a given structure in DNA1
