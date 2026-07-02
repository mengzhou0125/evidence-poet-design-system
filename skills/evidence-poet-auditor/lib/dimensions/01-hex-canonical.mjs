// Dimension #1 · Hex literal canonical (Layer 1 · universal)

import { scanColors, nearestCanonical } from '../color.mjs';
import { normalizeColor } from '../spec.mjs';

export const dimension = {
  id: '01-hex-canonical',
  label: 'Hex literal canonical',
  layer: 1,
  applicability: 'universal',
};

// Recognized extension namespaces (union across surface profiles · per design.md
// §"Extension governance" rule 1). Used for the GLOBAL governance fallback below so a
// correctly-governed extension color isn't flagged just because no surface profile
// attached to the file (e.g. a linked .css the profile's filePattern didn't match).
const GLOBAL_EXT_NAMESPACES = ['--review-', '--status-', '--env-', '--audit-', '--severity-',
  '--badge-', '--data-', '--tag-', '--bright-', '--tint-', '--ink-'];
// An inline WCAG rationale comment (rule 2) — a contrast ratio, "WCAG", or a *-on-this pairing.
const WCAG_RATIONALE_RE = /\/\*[^*]*(\d(?:\.\d+)?\s*:\s*1|wcag|white-on|ink-on|on-this)[^*]*\*\//i;

// Detect if a hex literal is in an "extension context" — defer judgment to #12/#11.
function isExtensionContext(strippedLine, originalLine, col, profile) {
  const before = strippedLine.slice(0, col - 1);

  // (1) Profile-specific (when a surface profile matched the file)
  if (profile && profile.extensions) {
    const ext = profile.extensions;
    if (ext.allowedNamespaces) {
      for (const ns of ext.allowedNamespaces) {
        const re = new RegExp(`${ns.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[a-zA-Z0-9_-]*\\s*:`);
        if (re.test(before)) return true;
      }
    }
    if (ext.tagOrthogonality && /\/\*[^*]*\*\//.test(originalLine)) return true;
  }

  // (2) Global governance fallback (works even with NO profile matched):
  //     a governed extension = hex defined under a recognized --namespace-*  AND  carrying an
  //     inline WCAG rationale comment. This honors the §Extension governance contract regardless
  //     of profile detection — contrast/role is then enforced by #11/#12, not re-flagged here.
  for (const ns of GLOBAL_EXT_NAMESPACES) {
    if (new RegExp(`${ns}[a-zA-Z0-9_-]*\\s*:`).test(before) && WCAG_RATIONALE_RE.test(originalLine)) {
      return true;
    }
  }
  return false;
}

export function check(file, ctx) {
  const { spec, profile } = ctx;
  const violations = [];
  const strippedLines = file.stripped.split('\n');
  const originalLines = file.original.split('\n');
  const colors = scanColors(file.stripped, normalizeColor);
  for (const c of colors) {
    if (spec.color.set.has(c.normalized)) continue;
    const sline = strippedLines[c.line - 1] || '';
    const oline = originalLines[c.line - 1] || '';
    if (isExtensionContext(sline, oline, c.col, profile)) continue;

    const near = nearestCanonical(c.normalized, spec.color.set);
    // Auto-fix ONLY when the drift is a near-exact rounding/typo of a canonical token
    // (Δ ≤ 2). Anything looser is a genuine color choice, not a drift — leave report-only.
    const autoFixable = near && near.distance <= 2;
    violations.push({
      dimensionId: dimension.id,
      severity: 'P0',
      path: file.path,
      line: c.line,
      col: c.col,
      value: c.raw,
      message: `non-canonical hex literal`,
      suggestion: near && near.distance <= 20
        ? `near ${near.value} (${spec.color.hexToName[near.value]} · Δ${near.distance.toFixed(1)})`
        : null,
      // Structured, machine-applicable replacement for --fix (col-anchored exact-token swap).
      fix: autoFixable ? { find: c.raw, replace: near.value, col: c.col } : undefined,
    });
  }
  return violations;
}
