# Evidence Poet Design System

A Claude Code skill ecosystem for the **DNA1 "Evidence Poet"** frontend design language.

**Five skills · one canonical spec.** Three lifecycle stages (**install → build → verify**)
plus two depth-specialists for the surfaces that earned dedicated production engines:

| Skill | Axis | What it does |
|---|---|---|
| **[`installer`](skills/evidence-poet-installer/)** | Lifecycle · **setup** | Copies the canonical `design.md` into your project + registers a DNA1 directive so every Claude session follows the spec |
| **[`builder`](skills/evidence-poet-builder/)** | Lifecycle · **apply (generalist)** | Builds in DNA1 across 4 surface scenarios (React narrative · vanilla data-dense · SVG diagram · content-review HTML). Defers to `diagram` for standalone SVGs and `review` for review HTMLs. |
| **[`diagram`](skills/evidence-poet-diagram/)** | Surface · **apply (diagram specialist)** | Production engine for standalone SVG diagrams: TYPE A–F chart taxonomy · Python generation method · validation pipeline |
| **[`review`](skills/evidence-poet-review/)** | Surface · **apply (review-HTML specialist)** | Production engine for content-review HTML: 2 layout archetypes · 2 tag profiles · CJK font discipline · DIFF mode · feedback collector |
| **[`auditor`](skills/evidence-poet-auditor/)** | Lifecycle · **verify** | 12 check dimensions across 3 layers · profile-based detection · CI-friendly exit codes |

`installer` · `builder` · `auditor` are the three lifecycle **stages**. `diagram` and
`review` sit on a different axis — they're depth-specialists for one surface each.
**Install once · build every time · use a specialist when the surface has one · audit before
declaring done.**

> **DNA1**: academic-journal × architecture-magazine. Sharp corners, three-font tension
> (serif headlines · sans body · mono labels), gold accents reserved for "worth-noticing"
> nodes, restrained motion. Full spec in
> [`skills/evidence-poet-installer/reference/design.md`](skills/evidence-poet-installer/reference/design.md).

---

## Pick what you need

Five skills, but you usually only want a subset. Match your situation to the right row:

| You want to… | Install | Trigger |
|---|---|---|
| Set DNA1 as the standard for one project | `installer` | `/install-dna1` |
| Build a React component / page / vanilla tool in DNA1 | `installer` + `builder` | `/build-dna1` |
| Occasionally draw a DNA1-styled SVG diagram | `diagram` (alone is fine) | `/draw-dna1` |
| Render a doc / spec / change as a side-by-side review HTML | `review` (alone is fine) | `/review-dna1` |
| Verify a build doesn't drift from the spec (e.g. in CI) | `auditor` (alone is fine) | `node audit.mjs <path>` |
| The full lifecycle for a long-term project | all 5 | each as above |

---

## Install

```bash
git clone https://github.com/mengzhou0125/evidence-poet-design-system.git
cd evidence-poet-design-system

# Install everything (default · 5 skills)
./install.sh          # macOS / Linux / Git Bash
.\install.ps1         # Windows PowerShell

# Or install just what you need
./install.sh installer                # one
./install.sh installer builder        # subset
./install.sh diagram                  # only the diagram specialist
.\install.ps1 review                  # only the review specialist
```

Each name accepts the short form (`installer`) or the full skill name
(`evidence-poet-installer`). Both scripts copy the chosen skills into
`~/.claude/skills/`. Idempotent — re-run to update.

---

## Use

### `/install-dna1` — wires DNA1 into a project

```
install DNA1 into this project
导入证据诗人设计规范
/install-dna1
```

Copies the spec to `<project>/.claude/design.md` and registers a directive in the project's
`CLAUDE.md` so every future Claude session follows DNA1 automatically.

### `/build-dna1` — build a component, page, or tool

```
build a DNA1 component / page / tool
用 DNA1 建 …
/build-dna1
```

Asks one bootstrap question (what content shape?) and infers framework + host, routing you
to the right scenario. For SVG diagrams and content-review HTML, it hands off to the
specialists below.

### `/draw-dna1` — draw a standalone SVG diagram

```
draw a DNA1 architecture / flow / hierarchy / matrix / comparison / concept diagram
用 DNA1 画架构图 / 流程图 / 决策矩阵 / 概念框架图
/draw-dna1
```

Picks a chart type (TYPE A–F), describes the structure for your sign-off, then generates a
spec-compliant `.svg` and validates it.

### `/review-dna1` — render a content-review HTML

```
render this doc as a review HTML
build a DNA1 review HTML for [spec / case study / PR / blog draft]
用 DNA1 出 review · review 这篇 [文档名]
/review-dna1
```

Asks one bootstrap question (what + how long?), picks layout archetype + tag profile, then
generates a single self-contained HTML — left ToC + per-section content with annotations +
per-section feedback collector. DIFF mode for incremental re-reviews.

### Audit — verify before declaring done

```bash
node ~/.claude/skills/evidence-poet-auditor/audit.mjs <path> --spec=<your-design.md>
```

Exit `0` pass · `1` P1 only · `2` setup error · `3` P0 violations (CI-friendly hard gate).

---

## Spec mirror sync

The DNA1 spec lives canonically at `skills/evidence-poet-installer/reference/design.md`.
The depth-specialist skills (`builder` · `diagram` · `review`) each bundle a mirror at
`skills/<name>/references/dna1-spec.md` so they're self-contained — they work even when
installed alone.

Spec drift between the canonical and the mirrors is checked by:

```bash
./scripts/sync-spec.sh
```

Exit `0` clean · exit `1` mirror drift detected (paths printed). Run after editing the
canonical spec, before committing.

---

## Layout

```
skills/
├── evidence-poet-installer/      installer (lifecycle · setup)
│   ├── SKILL.md · README.md
│   ├── reference/design.md       canonical DNA1 spec (copied to projects)
│   └── templates/claude_md_directive.md
│
├── evidence-poet-builder/        builder's guide (lifecycle · apply · generalist)
│   ├── SKILL.md · README.md
│   └── references/
│       ├── dna1-spec.md          spec mirror
│       ├── application-scenarios.md  5 scenarios + hybrid + 6th-scenario workflow
│       └── anti-patterns.md      guardrails + strict rules + extension governance
│
├── evidence-poet-diagram/        diagram-surface engine (apply · diagram specialist)
│   ├── SKILL.md · README.md
│   └── references/
│       ├── dna1-spec.md          spec mirror (skill is self-contained)
│       ├── svg-spec.md           SVG-specific token application
│       ├── chart-types.md        TYPE A–F decision tree
│       └── generation-method.md  Python-list generation + validation
│
├── evidence-poet-review/         review-HTML engine (apply · review specialist)
│   ├── SKILL.md · README.md
│   └── references/
│       ├── dna1-spec.md          spec mirror
│       ├── tokens.css            base + review-extension CSS variables (YaHei-first stacks)
│       ├── components.css        all class rules · 2 layout archetypes · tag styles · feedback block
│       ├── feedback-collector.js self-contained IIFE · "Copy all feedback" button
│       ├── example.html          double-clickable demo of both archetypes
│       ├── tag-profiles.md       Profile A editorial vs Profile B technical
│       ├── review-roles.md       Layer 0 baseline + Layer 1+ role taxonomy
│       └── diff-mode.md          incremental re-review mode
│
└── evidence-poet-auditor/        verification (lifecycle · verify)
    ├── SKILL.md · README.md · PLAN.md
    ├── audit.mjs                 CLI orchestrator (0 npm deps · Node stdlib)
    ├── lib/                      12 dimension modules + spec / walker / report
    └── surface-profiles/         4 built-in profiles (react-display · svg-diagram · review-html · data-heavy)

install.sh · install.ps1 · scripts/sync-spec.sh · README.md · LICENSE
```

---

## Versioning

The spec carries a `version` field in its §0 JSON. **Current: v1.1.0.** Bump on every
change: **PATCH** for clarifications · **MINOR** for additive (new token / pattern /
guardrail) · **MAJOR** for breaking (changed or removed tokens / rules). The installer
auto-updates projects when the source is newer.

Each skill's `SKILL.md` carries its own change history. Skills evolve independently within
the monorepo — a spec bump goes to `installer` and propagates to mirrors via
`./scripts/sync-spec.sh`; a workflow refinement in `builder` or `review` doesn't touch the
others.

---

## Uninstall

```bash
rm -rf ~/.claude/skills/evidence-poet-installer \
       ~/.claude/skills/evidence-poet-builder \
       ~/.claude/skills/evidence-poet-diagram \
       ~/.claude/skills/evidence-poet-review \
       ~/.claude/skills/evidence-poet-auditor
```

Or remove just one: `rm -rf ~/.claude/skills/evidence-poet-<name>`.

To remove DNA1 from a specific project: delete `<project>/.claude/design.md` and remove the
block between `<!-- DNA1-DIRECTIVE-START -->` and `<!-- DNA1-DIRECTIVE-END -->` in the
project's `CLAUDE.md`.

---

## License

MIT. See [LICENSE](LICENSE).
