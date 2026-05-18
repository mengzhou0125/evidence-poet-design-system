---
name: evidence-poet-design-system
description: One-shot installer for the DNA1 ("Evidence Poet") frontend design system. Use this skill when the user asks to install / import / set up / 安装 / 导入 the DNA1 design system, Evidence Poet design system, 证据诗人设计规范, or runs /install-dna1 in a frontend project. The skill is an installer — it copies the canonical design spec into the current project's .claude/design.md and registers a directive in the project's CLAUDE.md so that all future Claude sessions in this project automatically follow the DNA1 standard when doing any frontend work (CSS, components, styling, color, typography, spacing, motion). Do NOT trigger this skill for general frontend questions or design feedback unrelated to installing DNA1.
---

# evidence-poet-design-system

A one-shot installer that wires the DNA1 ("Evidence Poet") design system into a target frontend project. After installation, the project's `CLAUDE.md` instructs all future Claude sessions to follow DNA1 for any frontend work — the skill itself does not need to load again.

---

## When to run

Trigger only on explicit user intent to install / import / 安装 / 导入 DNA1 into a project. Examples:

- "install DNA1 into this project"
- "把 DNA1 装到这个工程"
- "导入证据诗人设计规范"
- "/install-dna1"
- "set up Evidence Poet design system here"

Do **not** trigger for:
- General frontend questions ("how do I style a button")
- Design feedback unrelated to install
- Questions *about* DNA1 (just answer using `reference/design.md`)
- A project that is clearly not frontend (no `package.json`, no `index.html`, no CSS/HTML/JS source)

---

## Installation workflow

Execute these steps in order. Do not skip verification. Use the Read / Write / Edit / Bash tools.

### Step 1 · Verify target is a frontend project

Check the current working directory for at least one of:
- `package.json`
- `index.html`
- `src/` containing `.css` / `.tsx` / `.jsx` / `.vue` / `.html` files

If none exist, stop and ask the user to confirm the target directory before proceeding.

### Step 2 · Check for existing install (idempotency)

Look for `.claude/design.md` in the project root. If it exists:
- Tell the user: "DNA1 is already installed at `.claude/design.md`. Overwrite with the latest spec from the skill? (yes/no)"
- If yes → continue to Step 3 (overwrite mode)
- If no → stop, report no changes made

Also look for the DNA1 directive block in the project's `CLAUDE.md` (delimited by `<!-- DNA1-DIRECTIVE-START -->` / `<!-- DNA1-DIRECTIVE-END -->`). If found and the user declined Step 2 overwrite, also skip Step 4.

### Step 3 · Copy the canonical design spec

Copy the skill's `reference/design.md` to `<project>/.claude/design.md`:

- If `<project>/.claude/` does not exist, create it.
- Source path: this skill's own `reference/design.md` (resolves to `<skill-dir>/reference/design.md` — when deployed, `~/.claude/skills/evidence-poet-design-system/reference/design.md`; during authoring, `design_skills/reference/design.md`).
- Do not modify the content during copy — it must be byte-identical to the canonical source.
- Do not copy `react-bindings.md`. It is React-specific and most target projects do not need it. If the user later asks for React-specific guidance, point them to the skill's `reference/react-bindings.md` directly.

### Step 4 · Register the directive in CLAUDE.md

If `<project>/CLAUDE.md` exists:
- Check for the sentinel block `<!-- DNA1-DIRECTIVE-START -->` / `<!-- DNA1-DIRECTIVE-END -->`.
- If present → replace the block with the latest directive template (see `templates/claude_md_directive.md` in this skill folder).
- If absent → append the directive block to the end of `CLAUDE.md`, separated by a blank line.

If `<project>/CLAUDE.md` does not exist:
- Create it with the directive block as the only content.

The directive template is in `templates/claude_md_directive.md` in this skill folder. Read it verbatim — do not paraphrase or shorten.

### Step 5 · Report

Tell the user, in one short message:

```
✓ DNA1 design system installed.
  - Spec:      .claude/design.md
  - Directive: CLAUDE.md (DNA1-DIRECTIVE section)

Future Claude sessions in this project will automatically follow DNA1 for all
frontend work. Re-run this skill anytime to update to the latest spec.
```

Do not summarize what DNA1 is. Do not explain the guardrails. Installation is silent — the directive itself carries the rules.

---

## What this skill does NOT do

- ❌ Does not refactor existing code to match DNA1 (that would be a separate skill — out of scope here)
- ❌ Does not audit the project for current compliance
- ❌ Does not install React components, scripts, fonts, or any runtime dependency
- ❌ Does not modify any file other than `.claude/design.md` and `CLAUDE.md`
- ❌ Does not run package managers, build commands, or generate code
- ❌ Does not deploy or push anything

Strictly file-level: copy one spec, register one directive. That is all.

---

## Reference

The canonical DNA1 spec lives in this skill's `reference/` folder:

- `reference/design.md` — framework-agnostic spec (tokens · color · type · components · motion · guardrails). This is what gets copied to target projects.
- `reference/react-bindings.md` — React/CSS-variable implementation mapping. Not copied during install; consult when target project is React-based and a session asks React-specific questions.

Upstream canonical source for DNA1 (do not edit during install): `portfolio/style/design.md` in the workspace. The skill's `reference/` is a byte-identical mirror; drift is forbidden.
