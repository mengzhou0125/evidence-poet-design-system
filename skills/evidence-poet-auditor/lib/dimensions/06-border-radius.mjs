// Dimension #6 · Border-radius (Guardrail A · must be 0 globally · Layer 1)

const RADIUS_CSS_RE = /border-radius\s*:\s*([^;}\n]+)/gi;
const RADIUS_JSX_RE = /borderRadius\s*:\s*['"]?([^,'"}\n]+)['"]?/g;

export const dimension = {
  id: '06-border-radius',
  label: 'Border-radius (Guardrail A: 0 globally)',
  layer: 1,
  applicability: 'universal',
};

export function check(file, ctx) {
  // In JS/TS/TSX: only check camelCase `borderRadius:` (inline style or CSS-in-JS object).
  // Hyphenated `border-radius:` in TSX is always prose/docs/string-content · skip.
  // In .css/.scss/.html: check hyphenated form.
  const isJs = /\.(tsx|jsx|ts|js)$/.test(file.path);
  const RADIUS_RE = isJs ? RADIUS_JSX_RE : RADIUS_CSS_RE;

  // Collect custom properties STATICALLY defined as zero in this file, so a
  // `border-radius: var(--x)` whose `--x: 0` is visually compliant isn't a false P0.
  // (DNA1 prefers a literal `0` — the builder prose teaches that — but the auditor must
  // not flag a var that is provably 0.)
  const zeroVars = new Set();
  const ZERO_DEF_RE = /(--[a-zA-Z0-9_-]+)\s*:\s*0(?:\.0+)?(?:px|%|em|rem)?\s*(?:!important)?\s*;/gi;
  let zd;
  while ((zd = ZERO_DEF_RE.exec(file.stripped)) !== null) zeroVars.add(zd[1].toLowerCase());

  const violations = [];
  const lines = file.stripped.split('\n');
  lines.forEach((line, i) => {
    let m;
    RADIUS_RE.lastIndex = 0;
    while ((m = RADIUS_RE.exec(line)) !== null) {
      const value = m[1].trim().replace(/\s*!important$/, '').trim();
      // accept 0, 0px, 0%, 0em, 0rem, var(--radius-0) etc.
      if (/^0(\.0+)?(px|%|em|rem)?$/i.test(value)) continue;
      if (/^var\(--radius-0\b/i.test(value)) continue;
      // accept var(--x) when --x is statically defined as 0 in this file
      const vref = value.match(/^var\(\s*(--[a-zA-Z0-9_-]+)\s*[,)]/i);
      if (vref && zeroVars.has(vref[1].toLowerCase())) continue;
      // accept multi-value where all are 0
      const tokens = value.split(/\s+/);
      if (tokens.every(t => /^0(\.0+)?(px|%|em|rem)?$/i.test(t))) continue;

      violations.push({
        dimensionId: dimension.id,
        severity: 'P0',
        path: file.path,
        line: i + 1,
        col: m.index + 1,
        value: `border-radius: ${value}`,
        message: `Guardrail A violated · border-radius must be 0 globally`,
        suggestion: 'set to 0',
      });
    }
  });
  return violations;
}
