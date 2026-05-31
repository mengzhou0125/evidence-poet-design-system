// Dimension #1 · Hex literal canonical (Layer 1 · universal)

import { scanColors, nearestCanonical } from '../color.mjs';
import { normalizeColor } from '../spec.mjs';

export const dimension = {
  id: '01-hex-canonical',
  label: 'Hex literal canonical',
  layer: 1,
  applicability: 'universal',
};

// Detect if a hex literal is in an "extension context" — defer judgment to #12.
// Two patterns covered:
//  (a) CSS var definition: `--<allowed-namespace>foo: #hex` on the same line before col
//  (b) Documented inline tag color: profile has tagOrthogonality AND original line
//      contains a `/* ... */` comment (the rationale that makes it auditable by #12)
function isExtensionContext(strippedLine, originalLine, col, profile) {
  if (!profile || !profile.extensions) return false;
  const ext = profile.extensions;

  if (ext.allowedNamespaces) {
    const before = strippedLine.slice(0, col - 1);
    for (const ns of ext.allowedNamespaces) {
      const re = new RegExp(`${ns.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[a-zA-Z0-9_-]*\\s*:`);
      if (re.test(before)) return true;
    }
  }
  if (ext.tagOrthogonality && /\/\*[^*]*\*\//.test(originalLine)) {
    // documented inline tag color · defer orthogonality + WCAG check to #12
    return true;
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
    });
  }
  return violations;
}
