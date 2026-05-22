# Evidence Poet Design System

A Claude Code skill ecosystem for the **DNA1 "Evidence Poet"** frontend design language.

Two skills + one canonical spec. The installer wires DNA1 into a target project. The builder helps you actually construct something in DNA1.

> **DNA1**: academic-journal × architecture-magazine. Sharp corners, three-font tension (serif headlines · sans body · mono labels), gold accents reserved for "worth-noticing" nodes, restrained motion. Full spec in [`evidence-poet-installer/reference/design.md`](evidence-poet-installer/reference/design.md).

---

## Install

```bash
git clone https://github.com/mengzhou0125/evidence-poet-design-system.git
cd evidence-poet-design-system
./install.sh          # macOS / Linux / Git Bash
.\install.ps1         # Windows PowerShell
```

Both scripts copy `evidence-poet-installer/` and `evidence-poet-builder/` into `~/.claude/skills/`. Idempotent — re-run to update.

---

## Use

The two skills compose: **install once per project**, then **build every time**.

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

Asks 3 bootstrap questions to route you to the right reference implementation. Four application scenarios covered: React, vanilla data-dense, SVG, content-review HTML.

---

## Layout

```
evidence-poet-installer/          installer skill
├── SKILL.md
├── reference/design.md           canonical DNA1 spec (copied to projects)
└── templates/claude_md_directive.md

evidence-poet-builder/            builder's guide
├── SKILL.md
└── references/
    ├── dna1-spec.md              spec mirror (same content as installer's)
    ├── application-scenarios.md  4 consumer scenarios + vanilla↔React translation
    └── anti-patterns.md          4 guardrails + 5 strict rules + extension governance
```

---

## Versioning

The spec carries a `version` field in its §0 JSON. **Current: v1.1.0.** Bump on every change: **PATCH** for clarifications · **MINOR** for additive (new token / pattern / guardrail) · **MAJOR** for breaking (changed or removed tokens / rules). The installer auto-updates projects when the source is newer.

---

## Uninstall

```bash
rm -rf ~/.claude/skills/evidence-poet-installer ~/.claude/skills/evidence-poet-builder
```

To remove DNA1 from a specific project: delete `<project>/.claude/design.md` and remove the block between `<!-- DNA1-DIRECTIVE-START -->` and `<!-- DNA1-DIRECTIVE-END -->` in the project's `CLAUDE.md`.

---

## License

MIT. See [LICENSE](LICENSE).
