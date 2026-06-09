// Dimension #8 · Motion / easing (Guardrail D · single canonical cubic-bezier · Layer 1)

// Match: transition-timing-function · animation-timing-function · transition shorthand · animation shorthand
const EASING_KEYWORDS = ['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out'];
const CUBIC_RE = /cubic-bezier\s*\(\s*([\d.\s,-]+)\s*\)/g;
const TRANSITION_RE = /\b(transition|animation)(-timing-function)?\s*:\s*([^;}\n]+)/gi;

export const dimension = {
  id: '08-motion-easing',
  label: 'Motion easing (Guardrail D · single canonical cubic-bezier only)',
  layer: 1,
  applicability: 'universal',
};

function normalizeCubic(str) {
  return str.replace(/\s+/g, '').toLowerCase();
}

export function check(file, ctx) {
  const canonical = normalizeCubic(ctx.spec.easing); // "cubic-bezier(0.16,1,0.3,1)"
  const violations = [];
  const lines = file.stripped.split('\n');
  lines.forEach((line, i) => {
    let m;
    TRANSITION_RE.lastIndex = 0;
    while ((m = TRANSITION_RE.exec(line)) !== null) {
      const value = m[3];
      // accept canonical cubic-bezier · accept var(--ease-*)
      const cubics = value.match(CUBIC_RE) || [];
      let bad = false;
      for (const c of cubics) {
        if (normalizeCubic(c) !== canonical) {
          bad = true;
          violations.push({
            dimensionId: dimension.id,
            severity: 'P0',
            path: file.path,
            line: i + 1,
            col: m.index + 1,
            value: c,
            message: `Guardrail D · non-canonical easing (must be ${ctx.spec.easing})`,
            suggestion: ctx.spec.easing,
          });
        }
      }
      // check keyword easings only if no var() reference exists
      if (!bad && !value.includes('var(') && cubics.length === 0) {
        for (const kw of EASING_KEYWORDS) {
          const kwRe = new RegExp(`\\b${kw}\\b`, 'i');
          if (kwRe.test(value)) {
            // only flag if it's in timing-function position
            // simple heuristic: keyword appears alone in a value chunk
            violations.push({
              dimensionId: dimension.id,
              severity: 'P1',
              path: file.path,
              line: i + 1,
              col: m.index + 1,
              value: kw,
              message: `Guardrail D · keyword easing "${kw}" violates single-easing rule`,
              suggestion: ctx.spec.easing,
            });
            break;
          }
        }
      }
    }
  });
  return violations;
}
