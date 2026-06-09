# Evidence Poet Design System

A Claude Code skill ecosystem for the **DNA1 "Evidence Poet"** frontend design language.

**Four skills · one canonical spec.** The system is a lifecycle — **install → build → audit** —
plus one surface that earned a dedicated generator:

| Component | Axis | What it does |
|---|---|---|
| **`skills/evidence-poet-installer/`** | Lifecycle · **setup** | Copies the canonical `design.md` into your project + registers a DNA1 directive so every Claude session follows the spec |
| **`skills/evidence-poet-builder/`** | Lifecycle · **apply (generalist)** | Builds in DNA1 across 4 surface scenarios (React narrative · vanilla data-dense · SVG diagram · content-review HTML). For standalone SVG diagrams it **defers to `evidence-poet-diagram`** |
| **`skills/evidence-poet-diagram/`** | Surface · **apply (diagram specialist)** | The production engine behind the builder's diagram surface: the TYPE A–F chart taxonomy, the Python generation method, and the validation pipeline that the builder deliberately doesn't carry |
| **`skills/evidence-poet-auditor/`** | Lifecycle · **verify** | 12 check dimensions across 3 layers with profile-based detection · its **Diagram** profile already covers what `evidence-poet-diagram` produces |

`installer`, `builder`, and `auditor` are the three lifecycle **stages**. `diagram` sits on a
different axis — it's the depth-specialist for the one surface (SVG diagrams) that needs real
generation tooling. **Install once · build every time · draw diagrams with the specialist · audit before declaring done.**

> **DNA1**: academic-journal × architecture-magazine. Sharp corners, three-font tension (serif headlines · sans body · mono labels), gold accents reserved for "worth-noticing" nodes, restrained motion. Full spec in [`skills/evidence-poet-installer/reference/design.md`](skills/evidence-poet-installer/reference/design.md).

---

## Install

```bash
git clone https://github.com/mengzhou0125/evidence-poet-design-system.git
cd evidence-poet-design-system
./install.sh          # macOS / Linux / Git Bash
.\install.ps1         # Windows PowerShell
```

Both scripts copy the four skills from `skills/` into `~/.claude/skills/`. Idempotent — re-run to update.

---

## Use

The skills compose: **install once per project · build every time · draw diagrams with the specialist · audit before declaring done.**

### `/install-dna1` — wires DNA1 into a project

```
install DNA1 into this project
导入证据诗人设计规范
/install-dna1
```

Copies the spec to `<project>/.claude/design.md` and registers a directive in the project's `CLAUDE.md` so every future Claude session follows DNA1 automatically.

### `/build-dna1` — build a component, page, or tool

```
build a DNA1 component / page / review HTML
用 DNA1 建 …
/build-dna1
```

Asks one bootstrap question (what are you building?) and infers framework + host from your answer, routing you to the right scenario.

### `/draw-dna1` — draw a standalone SVG diagram

```
draw a DNA1 architecture / flow / hierarchy / matrix / comparison / concept diagram
用 DNA1 画架构图 / 流程图 / 决策矩阵 / 概念框架图
/draw-dna1
```

The diagram-surface engine: picks a chart type (TYPE A–F), describes the structure for your sign-off, then generates a spec-compliant `.svg` and validates it.

### Audit — verify before declaring done

```bash
node ~/.claude/skills/evidence-poet-auditor/audit.mjs <path> --spec=<your-design.md>
```

---

## Layout

```
skills/
├── evidence-poet-installer/      installer skill (lifecycle · setup)
│   ├── SKILL.md
│   ├── reference/design.md       canonical DNA1 spec (copied to projects)
│   └── templates/claude_md_directive.md
│
├── evidence-poet-builder/        builder's guide (lifecycle · apply · generalist)
│   ├── SKILL.md
│   └── references/
│       ├── dna1-spec.md          spec mirror (same content as installer's)
│       ├── application-scenarios.md  4 scenarios + hybrid + 5th-scenario workflow
│       └── anti-patterns.md      guardrails + strict rules + extension governance
│
├── evidence-poet-diagram/        diagram-surface engine (apply · diagram specialist)
│   ├── SKILL.md
│   └── references/
│       ├── dna1-spec.md          bundled DNA1 spec (the diagram skill is self-contained)
│       ├── svg-spec.md           SVG-specific token application · spacing scale · canvas rules
│       ├── chart-types.md        TYPE A–F decision tree + layout templates
│       └── generation-method.md  Python-list generation method + validation pipeline
│
└── evidence-poet-auditor/        verification skill (lifecycle · verify)
    ├── SKILL.md · PLAN.md
    ├── audit.mjs                 CLI orchestrator (0 npm deps · Node stdlib)
    ├── lib/                      modules + 12 dimension checks
    └── surface-profiles/         4 surface-type detection profiles (JSON)

install.sh · install.ps1 · README.md · LICENSE
```

---

## Versioning

The spec carries a `version` field in its §0 JSON. **Current: v1.1.0.** Bump on every change: **PATCH** for clarifications · **MINOR** for additive (new token / pattern / guardrail) · **MAJOR** for breaking (changed or removed tokens / rules). The installer auto-updates projects when the source is newer.

---

## Uninstall

```bash
rm -rf ~/.claude/skills/evidence-poet-installer \
       ~/.claude/skills/evidence-poet-builder \
       ~/.claude/skills/evidence-poet-diagram \
       ~/.claude/skills/evidence-poet-auditor
```

To remove DNA1 from a specific project: delete `<project>/.claude/design.md` and remove the block between `<!-- DNA1-DIRECTIVE-START -->` and `<!-- DNA1-DIRECTIVE-END -->` in the project's `CLAUDE.md`.

---

## License

MIT. See [LICENSE](LICENSE).
