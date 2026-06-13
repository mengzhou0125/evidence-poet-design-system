# Gating your build with the auditor

The auditor is **opt-in per project**. Wire it into a project that consumes the
Evidence Poet (DNA1) design system so drift is caught **at commit / build time**,
not after the fact. Two entry points — use either or both.

The auditor's exit codes are designed for this:

| exit | meaning | gate |
|---|---|---|
| `0` | pass (no P0/P1; P2-only is OK) | proceed |
| `1` | P1 only (should-fix) | warn, don't block |
| `2` | setup error (spec missing, bad path) | fail loudly |
| `3` | P0 present (must-fix) | **block** |

`--format=summary` gives a plain-language report (no ANSI color) that reads well
in a CI log or a pre-commit terminal.

---

## A · pre-commit hook (catches drift before it's committed)

Copy [`pre-commit.sample`](pre-commit.sample) to your repo's `.git/hooks/pre-commit`
and make it executable (`chmod +x .git/hooks/pre-commit`). Set `EPDS_AUDITOR` to
where this skill lives (its deployed location is `~/.claude/skills/evidence-poet-auditor`).

It blocks the commit on P0 (exit 3), warns on P1 (exit 1), and lets P2 / clean through.

## B · npm script (run by hand or in a build/CI step)

In the consuming project's `package.json`:

```json
{
  "scripts": {
    "audit": "node \"$EPDS_AUDITOR/audit.mjs\" ./src --spec=.claude/design.md --format=summary",
    "audit:gate": "node \"$EPDS_AUDITOR/audit.mjs\" ./src --spec=.claude/design.md --format=summary || ([ $? -eq 1 ] && exit 0 || exit 1)"
  }
}
```

- `npm run audit` — always prints the report (informational).
- `npm run audit:gate` — exits non-zero only on P0/setup-error (P1 passes). Put this
  in front of `build` / `deploy` to hard-gate on P0:
  `"build": "npm run audit:gate && tsc -b && vite build"`.

> The spec lives at `.claude/design.md` if the project was set up by the
> `evidence-poet-installer`; otherwise point `--spec=` at your canonical `design.md`.

## Notes

- The auditor is **pure static analysis** (0 npm deps). It checks tokens, fonts,
  radius, color discipline, easing, spacing, extension governance — **not** rendered
  appearance. Visual regression, responsive QA, and keyboard/screen-reader a11y need
  a *rendered* page (a browser); run those in a separate render-time lane
  (e.g. the `accessibility-review` skill + a viewport screenshot sweep), not here.
- `builder` is an **authoring-time** guide, not a CI step — there is nothing to "run"
  for builder in a hook. Only the auditor belongs in the gate.
