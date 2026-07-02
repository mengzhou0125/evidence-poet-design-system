// lib/fix.mjs — review-gate auto-fix for high-certainty drifts (dim #01 hex · dim #08 easing)
//
// Design contract (per the 2026-07-02 auditor closed-loop redesign):
//   - Only violations carrying a structured `fix` field are touched. Today that is exactly the
//     two exact-token-replacement dimensions: 01-hex (Δ≤2 near-canonical) and 08-easing (P0 cubic).
//     Structural / ambiguous findings stay report-only — they never get a `fix` field upstream.
//   - Every replacement is verified against the live file line BEFORE writing (col-anchored when a
//     col is given, else located by exact string match). A line that has shifted since the audit
//     read is skipped, not blindly patched.
//   - Dry-run is the default (audit.mjs passes { apply:false }); nothing is written unless --apply.
//
// A `fix` field is: { find: <exact substring>, replace: <canonical>, col?: <1-based column> }

import { readFileSync, writeFileSync } from 'node:fs';

// Group fixable violations by file, preserving source order.
export function planFixes(violations) {
  const byFile = {};
  for (const v of violations) {
    if (!v.fix) continue;
    (byFile[v.path] ||= []).push(v);
  }
  return byFile;
}

// Apply a file's fixes to its content string. Pure — returns the new content + audit trail,
// does not write. Handles multiple fixes per line safely:
//   - col-anchored fixes apply right-to-left so earlier columns stay valid;
//   - string-located fixes apply afterward via indexOf on the (possibly already-edited) line.
export function applyFixesToContent(content, fixVs) {
  const lines = content.split('\n');
  const applied = [];
  const skipped = [];
  const changedLines = []; // { line, before, after }

  const byLine = {};
  for (const v of fixVs) (byLine[v.line] ||= []).push(v);

  for (const lnStr of Object.keys(byLine)) {
    const ln = Number(lnStr);
    const original = lines[ln - 1];
    if (original === undefined) {
      for (const v of byLine[lnStr]) skipped.push({ v, reason: 'line no longer exists' });
      continue;
    }
    let line = original;
    const group = byLine[lnStr];
    const colAnchored = group.filter(v => v.fix.col).sort((a, b) => b.fix.col - a.fix.col);
    const strLocated = group.filter(v => !v.fix.col);

    for (const v of colAnchored) {
      const { find, replace, col } = v.fix;
      const seg = line.slice(col - 1, col - 1 + find.length);
      if (seg === find) {
        line = line.slice(0, col - 1) + replace + line.slice(col - 1 + find.length);
        applied.push(v);
      } else {
        skipped.push({ v, reason: `column mismatch (expected "${find}", found "${seg}")` });
      }
    }
    for (const v of strLocated) {
      const { find, replace } = v.fix;
      const idx = line.indexOf(find);
      if (idx >= 0) {
        line = line.slice(0, idx) + replace + line.slice(idx + find.length);
        applied.push(v);
      } else {
        skipped.push({ v, reason: `string not found on line ("${find}")` });
      }
    }

    if (line !== original) changedLines.push({ line: ln, before: original, after: line });
    lines[ln - 1] = line;
  }

  return { content: lines.join('\n'), applied, skipped, changedLines };
}

// Orchestrate over all files. When apply=false (default) computes the plan without writing.
// When apply=true writes each changed file. Returns a summary for the caller to print.
export function runFixes(violations, { apply = false } = {}) {
  const byFile = planFixes(violations);
  const files = [];
  let appliedTotal = 0;
  let skippedTotal = 0;

  for (const path of Object.keys(byFile)) {
    let content;
    try {
      content = readFileSync(path, 'utf8');
    } catch (e) {
      files.push({ path, error: `cannot read: ${e.message}`, changedLines: [], applied: [], skipped: [] });
      continue;
    }
    const res = applyFixesToContent(content, byFile[path]);
    appliedTotal += res.applied.length;
    skippedTotal += res.skipped.length;
    if (apply && res.changedLines.length) {
      try {
        writeFileSync(path, res.content, 'utf8');
        res.written = true;
      } catch (e) {
        res.error = `cannot write: ${e.message}`;
      }
    }
    files.push({ path, ...res });
  }

  return { files, appliedTotal, skippedTotal, fixableFiles: files.length };
}
