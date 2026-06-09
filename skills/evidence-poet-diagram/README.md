# evidence-poet-diagram

The **diagram-surface production engine** for the DNA1 ("Evidence Poet") design language.
When you need a **finished, standalone SVG diagram** — an architecture chart, a flow chart,
a decision matrix, a hierarchy tree, a comparison figure, or a concept-framework figure —
in DNA1, this skill gives you the chart-type taxonomy, the generation method, and the
validation pipeline to produce one that is spec-compliant on the first pass.

## Install just this skill

```bash
./install.sh diagram           # macOS / Linux / Git Bash
.\install.ps1 diagram          # Windows PowerShell
```

Self-contained — bundles its own DNA1 spec mirror. Works without `installer` if you're only
drawing diagrams (no project install needed).

## Trigger it

```
draw an architecture / flow / hierarchy / matrix / comparison / concept diagram in DNA1
用 DNA1 画一个 [架构图 / 流程图 / 决策矩阵 / 层级图 / 概念框架图]
make a DNA1-styled SVG diagram
/draw-dna1
```

## What it does

1. Reads the spec + SVG-specific application + chart-type taxonomy
2. Picks the chart type via the TYPE A–F decision tree (Matrix / Coordinate / Flow /
   Hierarchy / Architecture / Comparison)
3. **Describes the structure in chat first** — node list · connections · canvas estimate ·
   color theme · file name — waits for your sign-off
4. Generates with the Python-list method (no bash heredoc SVG · no magic numbers · canvas
   sized top-down from content · pre-write placeholder validation)
5. Validates: XML syntax · waste-ratio < 15% · color/geometry spec compliance
6. Saves the `.svg` and reports the path

## What it does NOT do

- Does not produce non-diagram visuals → `evidence-poet-builder`
- Does not install the spec → `evidence-poet-installer`
- Does not audit its output → `evidence-poet-auditor --surface=svg-diagram`

## Files

- `SKILL.md` — Claude's manifest
- `references/dna1-spec.md` — canonical token spec (bundled mirror)
- `references/svg-spec.md` — SVG-specific token application · spacing scale · canvas rules
- `references/chart-types.md` — TYPE A–F decision tree + layout templates
- `references/generation-method.md` — Python-list generation method + validation pipeline

## Where this fits

Lifecycle: install → build → verify. This sits on a different axis — it's the
**depth-specialist for one surface (SVG)**, parallel to `evidence-poet-review` which is the
depth-specialist for content-review HTML. `evidence-poet-builder` Scenario C defers
standalone diagrams here.
