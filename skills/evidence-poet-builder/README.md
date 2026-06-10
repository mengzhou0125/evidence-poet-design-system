# evidence-poet-builder

The **builder's guide** for the DNA1 ("Evidence Poet") design language. When you need to
construct something new — a React component, a vanilla single-file tool, a diagram, or a
content-review HTML — in DNA1, this skill gives you the canonical spec, the right reference
implementation to copy from, and the anti-patterns to avoid.

DNA1's character, in one line: *academic journal × architecture magazine — mono labels for
information order, serif headlines for narrative weight, gold lines for moments worth pausing.
Restrained, rational, never cold.*

## Install just this skill

```bash
./install.sh builder           # macOS / Linux / Git Bash
.\install.ps1 builder          # Windows PowerShell
```

Or install the whole ecosystem with `./install.sh` (no args). You typically want
`installer` together with `builder` — install copies the spec into the target project
(once); builder helps you build with it (every time).

## Trigger it

```
build a [component / page / tool / diagram / review HTML] in DNA1
用 DNA1 建一个 [...]
make a DNA1-styled [...]
/build-dna1
```

## What it does

Asks **one bootstrap question** (what content shape) and infers the rest:

| Content shape | Framework default | Reference scenario |
|---|---|---|
| Narrative / story page | React/TSX | A · React narrative |
| Data-dense surface | vanilla HTML/CSS/JS | B · vanilla data-dense |
| Diagram | SVG | C · defers to `evidence-poet-diagram` |
| Content-review HTML | vanilla HTML (or React) | D · defers to `evidence-poet-review` |
| Hybrid | — | E · merge 2 closest |

Then walks you through: read the spec → pick the reference scenario → honor the
anti-patterns (4 DNA1 guardrails + user-strict rules) → propose architecture before coding
(for multi-file builds) → token discipline while coding → hand off to `evidence-poet-auditor`
for post-build verification.

## What it does NOT do

- Does not install the spec → `evidence-poet-installer`
- Does not generate finished SVG diagrams → [`svg-diagram-skill`](https://github.com/mengzhou0125/svg-diagram-skill) (separate repo · pluggable spec · DNA1 default)
- Does not produce review HTML at depth (Scenario D defers to → [`html-review-skill`](https://github.com/mengzhou0125/html-review-skill), separate repo · pluggable spec · DNA1 default)
- Does not run package managers, build, or deploy
- Does not make product / content decisions — only how to render them in DNA1

## Files

- `SKILL.md` — Claude's manifest
- `references/dna1-spec.md` — canonical token spec (mirror of installer's `reference/design.md`)
- `references/application-scenarios.md` — the 5 scenarios (A–E) + hybrid + 6th-scenario workflow
- `references/anti-patterns.md` — DNA1 guardrails + user-strict rules + extension governance

## Where this fits

Lifecycle: **install → build → verify**. This is the **build (generalist)** stage —
construct in DNA1 across surfaces. For two surfaces, depth-specialist skills (in
separate repos · pluggable spec · DNA1 default) do better:

- [`svg-diagram-skill`](https://github.com/mengzhou0125/svg-diagram-skill) — standalone
  SVG diagrams
- [`html-review-skill`](https://github.com/mengzhou0125/html-review-skill) —
  content-review HTML
