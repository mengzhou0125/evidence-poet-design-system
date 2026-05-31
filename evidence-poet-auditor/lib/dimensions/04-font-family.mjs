// Dimension #4 · Font family (3 canonical only · Layer 1)

const FONT_FAMILY_RE = /font-family\s*:\s*([^;}\n]+)/gi;
// JS/TS style: fontFamily: '...' or fontFamily:"..."
const JS_FONT_RE = /\bfontFamily\s*:\s*['"]([^'"]+)['"]/g;

export const dimension = {
  id: '04-font-family',
  label: 'Font family (only 3 canonical · Playfair Display / Plus Jakarta Sans / DM Mono)',
  layer: 1,
  applicability: 'universal',
};

function checkValue(value, spec) {
  // Extract first family name (before comma), strip quotes
  const first = value.split(',')[0].trim().replace(/^["']|["']$/g, '').toLowerCase();
  // Allow: canonical name · CSS keyword (inherit/initial/unset/system-ui generic) · var()
  if (value.includes('var(')) return true;
  const keywords = ['inherit', 'initial', 'unset', 'revert', 'currentcolor'];
  if (keywords.includes(first)) return true;
  if (spec.font.set.has(first)) return true;
  return false;
}

export function check(file, ctx) {
  const violations = [];
  const lines = file.stripped.split('\n');
  lines.forEach((line, i) => {
    // CSS-style
    let m;
    FONT_FAMILY_RE.lastIndex = 0;
    while ((m = FONT_FAMILY_RE.exec(line)) !== null) {
      const value = m[1].trim().replace(/\s*!important$/, '').trim();
      if (checkValue(value, ctx.spec)) continue;
      violations.push({
        dimensionId: dimension.id,
        severity: 'P0',
        path: file.path,
        line: i + 1,
        col: m.index + 1,
        value: `font-family: ${value.slice(0, 60)}`,
        message: `non-canonical font · only Playfair Display / Plus Jakarta Sans / DM Mono allowed`,
        suggestion: 'use one of the 3 canonical fonts',
      });
    }
    // JS-style (React inline style)
    JS_FONT_RE.lastIndex = 0;
    while ((m = JS_FONT_RE.exec(line)) !== null) {
      const value = m[1];
      if (checkValue(`"${value}"`, ctx.spec)) continue;
      violations.push({
        dimensionId: dimension.id,
        severity: 'P0',
        path: file.path,
        line: i + 1,
        col: m.index + 1,
        value: `fontFamily: '${value}'`,
        message: `non-canonical font in JS · only 3 canonical allowed`,
        suggestion: null,
      });
    }
  });
  return violations;
}
