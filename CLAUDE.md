# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Status (2026-05-17)**: skill authored. `SKILL.md` + `templates/claude_md_directive.md` + `reference/` in place. Not yet deployed to `~/.claude/skills/`. Treat as v0.1 — observe real usage before iterating.
>
> **Skill name**: `evidence-poet-design-system`
> **Shape**: one-shot installer. Copies `reference/design.md` → `<project>/.claude/design.md` and injects a directive section into `<project>/CLAUDE.md` (delimited by `<!-- DNA1-DIRECTIVE-START/END -->` sentinels). After install, the target project follows DNA1 autonomously — the skill itself does not need to load again.
> **Trigger**: explicit install intent only (e.g., "install DNA1", "导入证据诗人设计规范", "/install-dna1"). See `SKILL.md` description for full trigger language.

---

## What this folder is

A Claude skill source for working with **DNA1 — "The Evidence Poet"**, Meng's design system for mengz.space. The intent is that when a session needs to generate, audit, or convert assets that must conform to DNA1, this skill loads as context so the model uses canonical tokens instead of guessing hex values from memory (the documented anti-pattern in [reference/design.md:400](reference/design.md:400)).

DNA1 itself is **not owned here** — see "Canonical source" below.

---

## Canonical source — DO NOT diverge

The two files in `reference/` are **byte-identical mirrors** of the canonical specs in `portfolio/style/`:

| Mirror here | Canonical upstream |
|---|---|
| `reference/design.md` | `../portfolio/style/design.md` — DNA1 token source (§0 JSON) + visual/type/component/motion rules + guardrails |

(Previously `reference/react-bindings.md` mirrored `../portfolio/style/react-bindings.md` here, but it was removed: it referenced portfolio-internal file paths that have no meaning outside that workspace, so it was inappropriate for a public, framework-agnostic skill. If you need React implementation guidance in the portfolio repo, read it directly from `../portfolio/style/react-bindings.md` — not from this skill.)

**Rules**:
- Treat `reference/` as **read-only**. Never edit it directly to change DNA1.
- DNA1 changes happen upstream in `portfolio/style/design.md`, then sync downstream. Per [reference/design.md:380](reference/design.md:380), `portfolio/portfolio/npm run sync:tokens` is the verification command (it covers 4 token-holding consumers and would need a 5th entry if this skill becomes a consumer).
- If a session edits `reference/design.md` here directly, that's drift — flag it and propose the edit upstream instead.

---

## File layout

```
design_skills/
├── CLAUDE.md                              this file · authoring/maintenance notes
├── SKILL.md                               skill definition (YAML frontmatter + installer instructions)
├── reference/
│   └── design.md                          canonical DNA1 spec mirror · COPIED to target on install
└── templates/
    └── claude_md_directive.md             the section injected into target project's CLAUDE.md
```

## Deploy

When ready (per `../claude_skills/CLAUDE.md` workflow):

```bash
cp -r ~/Documents/workspace/design_skills ~/.claude/skills/evidence-poet-design-system
```

Verify with `ls ~/.claude/skills/evidence-poet-design-system/` — should see `SKILL.md`, `reference/`, `templates/`. Never symlink on Windows.

## Iterating on the skill

When updating any of the files here:

- **`SKILL.md` description change** → affects when Claude triggers the skill. Test by saying example trigger phrases in a fresh session.
- **`reference/design.md` change** → must originate upstream (`portfolio/style/design.md`) and propagate here, never the reverse. After update, already-installed target projects keep their old copy — they need to re-run the skill to refresh.
- **`templates/claude_md_directive.md` change** → only affects projects installed *after* the change. Already-installed projects need the skill re-run with overwrite=yes to get the new directive.

Idempotency contract: the skill detects the `<!-- DNA1-DIRECTIVE-START/END -->` sentinels and replaces the block on re-install. Never rename or remove these sentinels — that breaks update detection.

## Out of scope (deliberately not in this skill)

- ❌ Refactoring existing code to comply with DNA1 — would be a separate skill (`evidence-poet-refactor`?). Workflow sketched out in chat 2026-05-17 but not built.
- ❌ Auditing a project for compliance — could be a sibling skill or a mode of the refactor skill.
- ❌ Scripts (no Python/Node helpers) — skill is pure markdown instructions to Claude.

---

## Working in this folder

- **Read first, edit rarely**: `reference/design.md` is the primary context. The token JSON at §0 (lines ~18–52) and the guardrails at §9 (lines ~282–306) are the hot path.
- **Quoting tokens to the user**: pull verbatim from §0 JSON or the §2/§3 tables. Never paraphrase hex values or font names — drift through approximation is the documented failure mode ([reference/design.md:400](reference/design.md:400)).
- **No build / lint / test commands** apply here yet — there is no code, only markdown reference material.

---

## Workspace integration (brief)

This folder is a sibling project under `~/Documents/workspace/`. Workspace-wide conventions:

- **SYNC_PROTOCOL**: when changes here affect another project (e.g., once deployed, breaking-change updates to the skill), emit an event to `_sync/outbox.md` rather than editing the other project. No `_sync/` exists here yet — create one when the first cross-project effect occurs. See [../meta_practice/_state/SYNC_PROTOCOL.md](../meta_practice/_state/SYNC_PROTOCOL.md).
- **Memory placement**: workspace uses the 4-bucket framework at [../meta_practice/best_practices/workflow/memory_placement_strategy.md](../meta_practice/best_practices/workflow/memory_placement_strategy.md). Skill-internal authoring notes go in this CLAUDE.md, not in auto-memory.
- **Sibling that already exists for skills work**: [../claude_skills/CLAUDE.md](../claude_skills/CLAUDE.md) is the dedicated skill-authoring workspace and documents the source → `~/.claude/skills/` deploy pattern. This `design_skills/` folder predates that consolidation; consider whether the finished skill should live here or move under `claude_skills/`.
