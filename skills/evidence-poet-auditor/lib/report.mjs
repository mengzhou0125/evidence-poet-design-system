// lib/report.mjs — terminal / JSON / review-HTML output

import { relative } from 'node:path';

const COLOR = {
  red:  s => `\x1b[31m${s}\x1b[0m`,
  yel:  s => `\x1b[33m${s}\x1b[0m`,
  dim:  s => `\x1b[2m${s}\x1b[0m`,
  bold: s => `\x1b[1m${s}\x1b[0m`,
  grn:  s => `\x1b[32m${s}\x1b[0m`,
  cya:  s => `\x1b[36m${s}\x1b[0m`,
};

const SEV_COLOR = { P0: COLOR.red, P1: COLOR.yel, P2: COLOR.cya };

export function reportTerminal(violations, ctx) {
  const { cwd, specPath, targetPath, profilesByFile, dimensionsRun } = ctx;

  console.log(COLOR.bold('\nevidence-poet-auditor'));
  console.log(COLOR.dim(`spec:    ${specPath}`));
  console.log(COLOR.dim(`target:  ${targetPath}`));
  console.log(COLOR.dim(`dimensions: ${dimensionsRun.join(', ')}`));
  console.log('');

  if (!violations.length) {
    console.log(COLOR.grn('✓ PASS · 0 violations'));
    return;
  }

  // Group by file
  const byFile = {};
  for (const v of violations) (byFile[v.path] ||= []).push(v);

  // Sort within file by line
  for (const path of Object.keys(byFile)) {
    byFile[path].sort((a, b) => a.line - b.line || a.col - b.col);
  }

  for (const [path, vs] of Object.entries(byFile)) {
    const profileName = profilesByFile[path] || '(unknown surface)';
    console.log(COLOR.bold(relative(cwd, path)) + COLOR.dim(`  · ${profileName}`));
    for (const v of vs) {
      const sev = (SEV_COLOR[v.severity] || COLOR.dim)(v.severity);
      const loc = COLOR.dim(`${v.line}:${v.col}`);
      const dim = COLOR.dim(`[${v.dimensionId}]`);
      let line = `  ${sev} ${loc} ${dim} ${v.message}`;
      if (v.value) line += ` ${COLOR.dim('·')} ${COLOR.red(v.value)}`;
      if (v.suggestion) line += `\n          ${COLOR.dim('→')} ${COLOR.grn(v.suggestion)}`;
      console.log(line);
    }
    console.log('');
  }

  const counts = { P0: 0, P1: 0, P2: 0 };
  for (const v of violations) counts[v.severity] = (counts[v.severity] || 0) + 1;
  const parts = [];
  if (counts.P0) parts.push(COLOR.red(`${counts.P0} P0`));
  if (counts.P1) parts.push(COLOR.yel(`${counts.P1} P1`));
  if (counts.P2) parts.push(COLOR.cya(`${counts.P2} P2`));
  console.log(COLOR.bold(`✗ FAIL · ${violations.length} violations (${parts.join(' · ')}) across ${Object.keys(byFile).length} files`));
}

// Plain-language summary · for humans / CI logs / quick reads.
// Same data as reportTerminal, but no ANSI color and phrased as sentences + grouped fixes.
export function reportSummary(violations, ctx) {
  const { cwd, filesScanned } = ctx;
  if (!violations.length) {
    console.log('PASS · No design-spec violations found. Nothing to fix.');
    return;
  }
  const counts = { P0: 0, P1: 0, P2: 0 };
  for (const v of violations) counts[v.severity] = (counts[v.severity] || 0) + 1;
  const fileCount = new Set(violations.map(v => v.path)).size;

  const parts = [];
  if (counts.P0) parts.push(`${counts.P0} must-fix (P0)`);
  if (counts.P1) parts.push(`${counts.P1} should-fix (P1)`);
  if (counts.P2) parts.push(`${counts.P2} note (P2)`);
  console.log(`Scanned ${filesScanned} file(s). Found ${violations.length} issue(s): ${parts.join(' · ')}, across ${fileCount} file(s).\n`);

  const fmt = v => {
    const loc = `${relative(cwd, v.path)}:${v.line}`;
    const val = v.value ? ` (${v.value})` : '';
    const fix = v.suggestion ? ` → fix: ${v.suggestion}` : '';
    return `  · ${loc} — ${v.message}${val}${fix}`;
  };

  const p0 = violations.filter(v => v.severity === 'P0');
  const p1 = violations.filter(v => v.severity === 'P1');
  if (p0.length) {
    console.log('MUST FIX (P0 — breaks the design language; fix before commit):');
    for (const v of p0) console.log(fmt(v));
    console.log('');
  }
  if (p1.length) {
    console.log('SHOULD FIX (P1):');
    for (const v of p1.slice(0, 12)) console.log(fmt(v));
    if (p1.length > 12) console.log(`  …and ${p1.length - 12} more P1 (use --format=terminal for the full list)`);
    console.log('');
  }
  if (counts.P2) console.log(`Plus ${counts.P2} P2 note(s) (low priority · --format=terminal or =json for detail).`);
}

export function reportJSON(violations, ctx) {
  const out = {
    auditor: 'evidence-poet-auditor',
    version: '0.2',
    spec: ctx.specPath,
    target: ctx.targetPath,
    dimensionsRun: ctx.dimensionsRun,
    summary: {
      totalViolations: violations.length,
      filesScanned: ctx.filesScanned,
      filesFailing: new Set(violations.map(v => v.path)).size,
      bySeverity: {},
      byDimension: {},
    },
    violations: violations.map(v => ({
      severity: v.severity,
      dimension: v.dimensionId,
      path: v.path,
      line: v.line,
      col: v.col,
      value: v.value,
      message: v.message,
      suggestion: v.suggestion || null,
      surface: ctx.profilesByFile[v.path] || null,
    })),
  };
  for (const v of violations) {
    out.summary.bySeverity[v.severity] = (out.summary.bySeverity[v.severity] || 0) + 1;
    out.summary.byDimension[v.dimensionId] = (out.summary.byDimension[v.dimensionId] || 0) + 1;
  }
  console.log(JSON.stringify(out, null, 2));
}

export function reportHTML(violations, ctx) {
  // EP review-HTML pattern · self-circular: auditor uses the system's own visual language
  const { cwd, specPath, targetPath, profilesByFile, dimensionsRun, filesScanned } = ctx;
  const byFile = {};
  for (const v of violations) (byFile[v.path] ||= []).push(v);

  const counts = { P0: 0, P1: 0, P2: 0 };
  for (const v of violations) counts[v.severity] = (counts[v.severity] || 0) + 1;

  const sevColor = { P0: '#A85F4D', P1: '#7E6720', P2: '#717171' };

  const sections = Object.entries(byFile).map(([path, vs]) => {
    const profileName = profilesByFile[path] || '(unknown surface)';
    const rows = vs.map(v => `
      <tr>
        <td class="sev" style="color:${sevColor[v.severity] || '#717171'}">${v.severity}</td>
        <td class="loc">${v.line}:${v.col}</td>
        <td class="dim">[${v.dimensionId}]</td>
        <td class="msg">${escapeHtml(v.message)}${v.value ? `<br><code>${escapeHtml(v.value)}</code>` : ''}</td>
        <td class="fix">${v.suggestion ? `<em>→ ${escapeHtml(v.suggestion)}</em>` : ''}</td>
      </tr>`).join('');
    return `
      <section class="file-block">
        <h2>${escapeHtml(relative(cwd, path))} <span class="profile">· ${profileName}</span></h2>
        <table>
          <thead><tr><th>SEV</th><th>LOC</th><th>DIM</th><th>VIOLATION</th><th>FIX</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </section>`;
  }).join('');

  const html = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<title>EP Auditor Report · ${escapeHtml(targetPath)}</title>
<style>
  :root {
    --bg: #F8F7F3; --ink: #1A1A18; --paper-border: #EDE9E2; --muted: #717171;
    --gold: #C8A84B; --serif: 'Playfair Display', serif; --sans: 'Plus Jakarta Sans', sans-serif;
    --mono: 'DM Mono', monospace;
  }
  body { background: var(--bg); color: var(--ink); font-family: var(--sans); margin: 0; padding: 48px; }
  h1 { font-family: var(--serif); font-size: 32px; font-weight: 700; margin: 0 0 8px; }
  .meta { font-family: var(--mono); font-size: 12px; color: var(--muted); margin-bottom: 32px; }
  .meta div { margin: 4px 0; }
  .summary { padding: 16px; border: 1px solid var(--paper-border); margin-bottom: 32px; display: flex; gap: 24px; }
  .summary .item { font-family: var(--mono); font-size: 13px; }
  .summary .num { font-family: var(--serif); font-size: 24px; display: block; }
  .file-block { margin-bottom: 32px; }
  .file-block h2 { font-family: var(--mono); font-size: 13px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--ink); border-bottom: 1px solid var(--paper-border); padding-bottom: 8px; }
  .profile { color: var(--muted); font-weight: 400; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th, td { text-align: left; padding: 8px 12px; border-bottom: 1px solid var(--paper-border); vertical-align: top; }
  th { font-family: var(--mono); font-size: 11px; text-transform: uppercase; color: var(--muted); letter-spacing: 0.06em; }
  td.sev { font-family: var(--mono); font-weight: 700; }
  td.loc { font-family: var(--mono); color: var(--muted); }
  td.dim { font-family: var(--mono); font-size: 11px; color: var(--muted); }
  td.msg code { background: #f5f5f3; padding: 2px 6px; font-family: var(--mono); font-size: 12px; }
  td.fix em { color: #527590; font-style: normal; }
  .pass { color: #5A7A5A; font-family: var(--serif); font-size: 28px; }
</style>
</head><body>
<h1>EP Auditor Report</h1>
<div class="meta">
  <div>SPEC: ${escapeHtml(specPath)}</div>
  <div>TARGET: ${escapeHtml(targetPath)}</div>
  <div>DIMENSIONS: ${dimensionsRun.join(' · ')}</div>
  <div>FILES SCANNED: ${filesScanned}</div>
</div>
<div class="summary">
  <div class="item"><span class="num" style="color:${sevColor.P0}">${counts.P0}</span>P0 must fix</div>
  <div class="item"><span class="num" style="color:${sevColor.P1}">${counts.P1}</span>P1 should fix</div>
  <div class="item"><span class="num" style="color:${sevColor.P2}">${counts.P2}</span>P2 note</div>
</div>
${violations.length === 0 ? '<p class="pass">✓ All checks passed.</p>' : sections}
</body></html>`;

  console.log(html);
}

function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}
