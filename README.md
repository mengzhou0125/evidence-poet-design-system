# Evidence Poet Design System

A Claude Code skill ecosystem for the **DNA1 "Evidence Poet"** frontend design language.

**Three skills · one canonical spec.** Architecture follows the spec + distribution + verification triad:

| Component | Layer | What it does |
|---|---|---|
| **`evidence-poet-installer/`** | Spec | Copies canonical `design.md` into your project + registers DNA1 directive so every Claude session follows the spec |
| **`evidence-poet-builder/`** | Distribution (apply-time) | Builds in DNA1 across 4 surface scenarios (React narrative · vanilla data-dense · SVG diagram · content-review HTML) + hybrid + 5th-scenario workflow. Each scenario is self-contained prose in `references/application-scenarios.md` — no separate framework to copy |
| **`evidence-poet-auditor/`** | Verification (post-build) | 12 check dimensions across 3 layers (universal · surface-modulated · surface-specific) with profile-based detection · catches drift the moment any consumer translates the spec |

Install once · build every time · audit before declaring done.

> **DNA1**: academic-journal × architecture-magazine. Sharp corners, three-font tension (serif headlines · sans body · mono labels), gold accents reserved for "worth-noticing" nodes, restrained motion. Full spec in [`evidence-poet-installer/reference/design.md`](evidence-poet-installer/reference/design.md).

---

## Install

```bash
git clone https://github.com/mengzhou0125/evidence-poet-design-system.git
cd evidence-poet-design-system
./install.sh          # macOS / Linux / Git Bash
.\install.ps1         # Windows PowerShell
```

Both scripts copy `evidence-poet-installer/` · `evidence-poet-builder/` · `evidence-poet-auditor/` into `~/.claude/skills/`. Idempotent — re-run to update.

---

## Use

The three skills compose: **install once per project · build every time · audit before declaring done.**

### `/install-dna1` — wires DNA1 into a project

```
install DNA1 into this project
导入证据诗人设计规范
/install-dna1
```

Copies the spec to `<project>/.claude/design.md` and registers a directive in the project's `CLAUDE.md` so every future Claude session follows DNA1 automatically.

### `/build-dna1` — actually build something

```
build a DNA1 component / page / SVG / review HTML
用 DNA1 建 …
/build-dna1
```

Asks one bootstrap question (what are you building?) and infers framework + host from your answer, routing you to the right scenario. Four scenarios covered: React narrative · vanilla data-dense · SVG diagram · content-review HTML · plus hybrid + new-scenario workflows.

---

## Layout

```
evidence-poet-installer/          installer skill (spec layer)
├── SKILL.md
├── reference/design.md           canonical DNA1 spec (copied to projects)
└── templates/claude_md_directive.md

evidence-poet-builder/            builder's guide (distribution layer)
├── SKILL.md
└── references/
    ├── dna1-spec.md              spec mirror (same content as installer's)
    ├── application-scenarios.md  4 scenarios + hybrid + 5th-scenario workflow · self-contained prose
    └── anti-patterns.md          4 guardrails + 5 strict rules + 6 spec-derived rules + extension governance

evidence-poet-auditor/            verification skill (verification layer)
├── SKILL.md · PLAN.md
├── audit.mjs                     CLI orchestrator (0 npm deps · Node stdlib)
├── lib/                          6 modules + 12 dimension checks
└── surface-profiles/            4 surface-type detection profiles (JSON)
```

---

## Versioning

The spec carries a `version` field in its §0 JSON. **Current: v1.1.0.** Bump on every change: **PATCH** for clarifications · **MINOR** for additive (new token / pattern / guardrail) · **MAJOR** for breaking (changed or removed tokens / rules). The installer auto-updates projects when the source is newer.

---

## Uninstall

```bash
rm -rf ~/.claude/skills/evidence-poet-installer ~/.claude/skills/evidence-poet-builder ~/.claude/skills/evidence-poet-auditor
```

To remove DNA1 from a specific project: delete `<project>/.claude/design.md` and remove the block between `<!-- DNA1-DIRECTIVE-START -->` and `<!-- DNA1-DIRECTIVE-END -->` in the project's `CLAUDE.md`.

---

## License

MIT. See [LICENSE](LICENSE).
