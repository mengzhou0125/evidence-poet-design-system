# Evidence Poet Design System

A Claude Code skill ecosystem for the **DNA1 "Evidence Poet"** frontend design language.

**Three skills in this repo · one canonical spec.** The full DNA1 lifecycle —
**install → build → verify**:

| Skill | Axis | What it does |
|---|---|---|
| **[`installer`](skills/evidence-poet-installer/)** | Lifecycle · **setup** | Copies the canonical `design.md` into your project + registers a DNA1 directive so every Claude session follows the spec |
| **[`builder`](skills/evidence-poet-builder/)** | Lifecycle · **apply (generalist)** | Builds in DNA1 across 4 surface scenarios (React narrative · vanilla data-dense · SVG diagram · content-review HTML). Defers to the two surface specialists below for standalone diagrams and review HTMLs. |
| **[`auditor`](skills/evidence-poet-auditor/)** | Lifecycle · **verify** | 12 check dimensions across 3 layers · profile-based detection · CI-friendly exit codes |

> **DNA1**: academic-journal × architecture-magazine. Sharp corners, three-font tension
> (serif headlines · sans body · mono labels), gold accents reserved for "worth-noticing"
> nodes, restrained motion. Full spec in
> [`skills/evidence-poet-installer/reference/design.md`](skills/evidence-poet-installer/reference/design.md).

---

## Two surface specialists · separate repos (pluggable design system)

Two depth-specialist skills live in their own repos so they can serve users who want the
surface tool **without DNA1** — both ship with DNA1 bundled as the **default** visual
style and accept any external spec via `--spec=<path>`:

| Repo | Surface | Role |
|---|---|---|
| **[`svg-diagram-skill`](https://github.com/mengzhou0125/svg-diagram-skill)** | SVG diagrams | TYPE A–F chart taxonomy · Python-list generation method · validation pipeline · pluggable spec (DNA1 default) |
| **[`html-review-skill`](https://github.com/mengzhou0125/html-review-skill)** | Content-review HTML | 2 layout archetypes · 2 tag profiles · CJK font discipline · DIFF mode · feedback collector · pluggable spec (DNA1 default) |

The builder skill's Scenarios C and D defer to these specialist repos.

---

## Pick what you need

| You want to… | Get from this repo (EPDS) | Get separately |
|---|---|---|
| Set DNA1 as the standard for one project | `installer` | — |
| Build a React component / page / vanilla tool in DNA1 | `installer` + `builder` | — |
| Verify a build doesn't drift from the spec (e.g. in CI) | `auditor` | — |
| Draw a standalone SVG diagram (DNA1 default · or your own spec) | — | [`svg-diagram-skill`](https://github.com/mengzhou0125/svg-diagram-skill) |
| Render a doc as a side-by-side review HTML (DNA1 default · or your own spec) | — | [`html-review-skill`](https://github.com/mengzhou0125/html-review-skill) |
| The full lifecycle for a long-term DNA1 project | all 3 here + both specialists | — |

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

### `/install-dna1` — wires DNA1 into a project

```
install DNA1 into this project
导入证据诗人设计规范
/install-dna1
```

Copies the spec to `<project>/.claude/design.md` and registers a directive in the project's
`CLAUDE.md` so every future Claude session follows DNA1 automatically. **This also signals
to the SVG and review skills** that the project has a spec — they auto-detect it via the
pluggable-spec mechanism (see below).

### `/build-dna1` — build a component, page, or tool

```
build a DNA1 component / page / tool
用 DNA1 建 …
/build-dna1
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
hand-built code). For DNA1 specifically, point `--spec=` at your project's `design.md` (or
this repo's canonical at `skills/evidence-poet-installer/reference/design.md`).

---

## Pluggable spec · how DNA1 reaches the surface skills

The `svg-diagram-skill` and `html-review-skill` each resolve a design-system spec in this
order:

1. **Explicit** — `--spec=<path>` argument or user prompt names a path
2. **Project-detected** — `<project>/.claude/design.md` exists (left by this repo's
   `evidence-poet-installer`)
3. **Bundled default** — the skill's own `specs/dna1-default.md` (a DNA1 mirror)

So three install patterns work cleanly:

- **DNA1 project**: run `evidence-poet-installer` in the project → `.claude/design.md`
  exists → surface skills auto-pick it up. No extra config.
- **Non-DNA1 project with custom spec**: drop your spec at `<project>/.claude/design.md`
  following the
  [`spec-interface.md`](https://github.com/mengzhou0125/svg-diagram-skill/blob/main/references/spec-interface.md)
  contract → surface skills use it.
- **Standalone use (no project context)**: skills fall back to bundled DNA1 default.

---

## Spec mirror sync

The DNA1 spec lives canonically at `skills/evidence-poet-installer/reference/design.md`.
The `builder` skill bundles a mirror at `skills/evidence-poet-builder/references/dna1-spec.md`
so it's self-contained.

```bash
./scripts/sync-spec.sh           # check (exit 1 on drift)
./scripts/sync-spec.sh --fix     # overwrite mirror with canonical
```

**Cross-repo sync** (manual until automated): when the canonical spec here changes, the
two sibling repos' bundled defaults need a separate sync:

- `svg-diagram-skill/specs/dna1-default.md`
- `html-review-skill/specs/dna1-default.md`

`cp` + commit + push in each clone. Future work: a multi-repo sync helper.

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

## Migrating from a previous install

If you previously installed the 5-skill ecosystem (before the 3-repo split):

```bash
# Remove the two skills that moved out
rm -rf ~/.claude/skills/evidence-poet-diagram
rm -rf ~/.claude/skills/evidence-poet-review

# Install the successors from their new repos
git clone https://github.com/mengzhou0125/svg-diagram-skill && cd svg-diagram-skill && ./install.sh && cd ..
git clone https://github.com/mengzhou0125/html-review-skill && cd html-review-skill && ./install.sh && cd ..

# Refresh this repo (now 3 skills)
cd evidence-poet-design-system
git pull
./install.sh
```

The trigger phrases are the same; the underlying skills are renamed and now support
pluggable specs.

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

To remove DNA1 from a specific project: delete `<project>/.claude/design.md` and remove the
block between `<!-- DNA1-DIRECTIVE-START -->` and `<!-- DNA1-DIRECTIVE-END -->` in the
project's `CLAUDE.md`.

---

## License

MIT. See [LICENSE](LICENSE).
