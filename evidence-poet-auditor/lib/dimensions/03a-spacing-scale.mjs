// Dimension #3a · Spacing scale adherence (Layer 1 · universal)
// Check that padding/margin/gap values come from the 4px-rooted canonical scale.

const SPACING_PROPS = ['padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
                       'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
                       'gap', 'row-gap', 'column-gap'];

// Use negative lookbehind so border-left / inset-top etc. don't match.
// Also skip 'top/right/bottom/left' as standalone properties (only valid on positioned elements · low signal).
const SPACING_RE = new RegExp(`(?<![a-zA-Z-])(${SPACING_PROPS.join('|')})\\s*:\\s*([^;}\\n]+)`, 'gi');
const VALUE_TOKEN_RE = /-?\d*\.?\d+(px|rem|em|%|vw|vh)?/g;

export const dimension = {
  id: '03a-spacing-scale',
  label: 'Spacing scale adherence (4px-rooted)',
  layer: 1,
  applicability: 'universal',
};

// Remove balanced calc()/var()/clamp()/min()/max()/env() spans (which we trust) BEFORE
// whitespace-tokenizing a value. Without this, `margin: calc(var(--x) * -1) 0 var(--y)`
// splits across the inner spaces into phantom tokens `*` and `-1` that escape the calc
// guard and raise false P1s. Replacing each span with a single space preserves the
// remaining real tokens (e.g. the trailing `0`).
function maskFunctional(value) {
  let out = '';
  for (let i = 0; i < value.length; ) {
    const fm = value.slice(i).match(/^(calc|var|clamp|min|max|env)\(/i);
    if (fm) {
      i += fm[0].length;
      let depth = 1;
      while (i < value.length && depth > 0) {
        if (value[i] === '(') depth++;
        else if (value[i] === ')') depth--;
        i++;
      }
      out += ' ';
    } else {
      out += value[i++];
    }
  }
  return out;
}

function isAcceptable(token, spec) {
  const t = token.trim();
  if (!t || t === '0' || t === 'auto' || t === 'inherit' || t === 'initial') return true;
  if (t.endsWith('%') || t.endsWith('vw') || t.endsWith('vh')) return true; // relative units · scale-free
  if (t.startsWith('var(')) return true; // CSS var · trust it
  if (t.startsWith('calc(')) return true; // calc · trust it (covered by 3b/3c eventually)
  // exact match against spec.spacing.set ({'0px', '4px', '8px', ..., '0.25rem', ...})
  if (spec.spacing.set.has(t)) return true;
  // px values: check numeric against scale
  const m = t.match(/^(-?\d*\.?\d+)px$/);
  if (m) {
    const n = Math.abs(parseFloat(m[1]));
    return spec.spacing.raw.includes(n);
  }
  return false;
}

export function check(file, ctx) {
  if (!['.css', '.scss', '.html'].some(e => file.path.endsWith(e))) return [];

  const violations = [];
  const lines = file.stripped.split('\n');
  lines.forEach((line, i) => {
    let m;
    SPACING_RE.lastIndex = 0;
    while ((m = SPACING_RE.exec(line)) !== null) {
      const prop = m[1];
      const value = m[2].trim().replace(/\s*!important$/, '').trim();
      const tokens = maskFunctional(value).split(/\s+/).map(t => t.replace(/[)(;,]+$/, '').replace(/^[)(;,]+/, ''));
      for (const t of tokens) {
        if (!t) continue;
        if (isAcceptable(t, ctx.spec)) continue;
        violations.push({
          dimensionId: dimension.id,
          severity: 'P1',
          path: file.path,
          line: i + 1,
          col: m.index + 1,
          value: `${prop}: ${t}`,
          message: `non-canonical spacing value "${t}" not on 4px scale [${ctx.spec.spacing.raw.join(',')}]`,
          suggestion: null,
        });
      }
    }
  });
  return violations;
}
