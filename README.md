# Evidence Poet Design System

A Claude Code skill ecosystem for the **Evidence Poet** frontend design language.

**Three skills in this repo · one canonical spec.** The full Evidence Poet lifecycle —
**install → build → verify**:

| Skill | Axis | What it does |
|---|---|---|
| **[`installer`](skills/evidence-poet-installer/)** | Lifecycle · **setup** | Copies the canonical `design.md` into your project + registers the directive so every Claude session follows the spec |
| **[`builder`](skills/evidence-poet-builder/)** | Lifecycle · **apply (generalist)** | Builds in Evidence Poet across 4 surface scenarios (React narrative · vanilla data-dense · SVG diagram · content-review HTML). Defers to the two surface specialists below for standalone diagrams and review HTMLs. |
| **[`auditor`](skills/evidence-poet-auditor/)** | Lifecycle · **verify** | 12 check dimensions across 3 layers · profile-based detection · CI-friendly exit codes |

> **Evidence Poet**: academic-journal × architecture-magazine. Sharp corners, three-font tension
> (serif headlines · sans body · mono labels), gold accents reserved for "worth-noticing"
> nodes, restrained motion. Full spec in
> [`skills/evidence-poet-installer/reference/design.md`](skills/evidence-poet-installer/reference/design.md).

---

## Two surface specialists · separate repos (pluggable design system)

Two depth-specialist skills live in their own repos so they can serve users who want the
surface tool **without Evidence Poet** — both ship with Evidence Poet bundled as the **default** visual
style and accept any external spec via `--spec=<path>`:

| Repo | Surface | Role |
|---|---|---|
| **[`svg-diagram-skill`](https://github.com/mengzhou0125/svg-diagram-skill)** | SVG diagrams | TYPE A–F chart taxonomy · Python-list generation method · validation pipeline · pluggable spec (Evidence Poet default) |
| **[`html-review-skill`](https://github.com/mengzhou0125/html-review-skill)** | Content-review HTML | 2 layout archetypes · 2 tag profiles · CJK font discipline · DIFF mode · feedback collector · pluggable spec (Evidence Poet default) |

The builder skill's Scenarios C and D defer to these specialist repos.

---

## Pick what you need

| You want to… | Get from this repo (EPDS) | Get separately |
|---|---|---|
| Set Evidence Poet as the standard for one project | `installer` | — |
| Build a React component / page / vanilla tool in Evidence Poet | `installer` + `builder` | — |
| Verify a build doesn't drift from the spec (e.g. in CI) | `auditor` | — |
| Draw a standalone SVG diagram (Evidence Poet default · or your own spec) | — | [`svg-diagram-skill`](https://github.com/mengzhou0125/svg-diagram-skill) |
| Render a doc as a side-by-side review HTML (Evidence Poet default · or your own spec) | — | [`html-review-skill`](https://github.com/mengzhou0125/html-review-skill) |
| The full lifecycle for a long-term Evidence Poet project | all 3 here + both specialists | — |

---

## Install

```bash
git clone https://github.com/mengzhou0125/evidence-poet-design-system.git
cd evidence-poet-design-system

# Install all 3 lifecycle skills (default)
./install.sh          # macOS / Linux / Git Bash
.\install.ps1         # Windows PowerShell

# Or install just what you need
./install.sh installer                # one
./install.sh installer builder        # subset
./install.sh auditor                  # only the auditor (CI usage)
```

For the surface specialists, install from their own repos:

```bash
# SVG diagrams
git clone https://github.com/mengzhou0125/svg-diagram-skill && cd svg-diagram-skill && ./install.sh

# Content-review HTMLs
git clone https://github.com/mengzhou0125/html-review-skill && cd html-review-skill && ./install.sh
```

All install scripts are idempotent — re-run to update.

---

## Use

### `/install-epds` — wires Evidence Poet into a project

```
install Evidence Poet into this project
导入证据诗人设计规范
/install-epds
```

Copies the spec to `<project>/.claude/design.md` and registers a directive in the project's
`CLAUDE.md` so every future Claude session follows Evidence Poet automatically. **This also signals
to the SVG and review skills** that the project has a spec — they auto-detect it via the
pluggable-spec mechanism (see below).

### `/build-epds` — build a component, page, or tool

```
build an Evidence Poet component / page / tool
用 Evidence Poet 建 …
/build-epds
```

Asks one bootstrap question (what content shape?) and infers framework + host, routing you
to the right scenario. For SVG diagrams and content-review HTML, it hands off to the
specialist skills (which you install separately from their own repos).

### Audit — verify before declaring done

```bash
node ~/.claude/skills/evidence-poet-auditor/audit.mjs <path> --spec=<your-design.md>
```

Exit `0` pass · `1` P1 only · `2` setup error · `3` P0 violations (CI-friendly hard gate).

The auditor works on output from **any** skill (this repo, the specialist repos, or
hand-built code). For Evidence Poet specifically, point `--spec=` at your project's `design.md` (or
this repo's canonical at `skills/evidence-poet-installer/reference/design.md`).

---

## Pluggable spec · how Evidence Poet reaches the surface skills

The `svg-diagram-skill` and `html-review-skill` each resolve a design-system spec in this
order:

1. **Explicit** — `--spec=<path>` argument or user prompt names a path
2. **Project-detected** — `<project>/.claude/design.md` exists (left by this repo's
   `evidence-poet-installer`)
3. **Bundled default** — the skill's own `specs/default-spec.md` (an Evidence Poet mirror)

So three install patterns work cleanly:

- **Evidence Poet project**: run `evidence-poet-installer` in the project → `.claude/design.md`
  exists → surface skills auto-pick it up. No extra config.
- **Non-Evidence Poet project with custom spec**: drop your spec at `<project>/.claude/design.md`
  following the
  [`spec-interface.md`](https://github.com/mengzhou0125/svg-diagram-skill/blob/main/references/spec-interface.md)
  contract → surface skills use it.
- **Standalone use (no project context)**: skills fall back to bundled Evidence Poet default.

---

## Spec mirror sync

The Evidence Poet spec lives canonically at `skills/evidence-poet-installer/reference/design.md`.
The `builder` skill bundles a mirror at `skills/evidence-poet-builder/references/spec.md`
so it's self-contained.

```bash
./scripts/sync-spec.sh           # check (exit 1 on drift)
./scripts/sync-spec.sh --fix     # overwrite mirror with canonical
```

**Cross-repo sync** (manual until automated): when the canonical spec here changes, the
two sibling repos' bundled defaults need a separate sync:

- `svg-diagram-skill/specs/default-spec.md`
- `html-review-skill/specs/default-spec.md`

`cp` + commit + push in each clone. Future work: a multi-repo sync helper.

---

## Layout

```
skills/
├── evidence-poet-installer/      installer (lifecycle · setup)
│   ├── SKILL.md · README.md
│   ├── reference/design.md       canonical Evidence Poet spec (copied to projects)
│   └── templates/claude_md_directive.md
│
├── evidence-poet-builder/        builder's guide (lifecycle · apply · generalist)
│   ├── SKILL.md · README.md
│   └── references/
│       ├── spec.md          spec mirror
│       ├── application-scenarios.md  5 scenarios + hybrid (C/D defer to external repos)
│       └── anti-patterns.md      guardrails + strict rules + extension governance
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
change: **PATCH** for clarifications · **MINOR** for additive · **MAJOR** for breaking.
The installer auto-updates projects when the source is newer.

Each skill's `SKILL.md` carries its own change history. Skills in this repo evolve
together (single git history); the surface specialists in their own repos evolve
independently.

---

## Uninstall

```bash
rm -rf ~/.claude/skills/evidence-poet-installer \
       ~/.claude/skills/evidence-poet-builder \
       ~/.claude/skills/evidence-poet-auditor
```

Or remove just one. Surface specialists removed from their own repos:

```bash
rm -rf ~/.claude/skills/svg-diagram-skill
rm -rf ~/.claude/skills/html-review-skill
```

To remove Evidence Poet from a specific project: delete `<project>/.claude/design.md` and remove the
block between `<!-- Evidence Poet-DIRECTIVE-START -->` and `<!-- Evidence Poet-DIRECTIVE-END -->` in the
project's `CLAUDE.md`.

---

## License

MIT. See [LICENSE](LICENSE).
