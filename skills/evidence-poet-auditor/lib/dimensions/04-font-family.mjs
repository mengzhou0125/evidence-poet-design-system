// Dimension #4 · Font family (3 canonical · + CJK fallback on CJK-bearing surfaces · Layer 1)

const FONT_FAMILY_RE = /font-family\s*:\s*([^;}\n]+)/gi;
// JS/TS style: fontFamily: '...' or fontFamily:"..."
const JS_FONT_RE = /\bfontFamily\s*:\s*['"]([^'"]+)['"]/g;

// CJK fonts that satisfy a Simplified-safe fallback (per design.md §3 "CJK / i18n font fallback").
// Presence of ANY of these in the stack is the high-value static check; exact ordering isn't statically verified.
const CJK_FONT_HINTS = [
  'microsoft yahei', 'yahei', 'pingfang', 'source han sans', 'source han serif',
  'noto sans sc', 'noto serif sc', 'noto sans cjk', 'noto serif cjk',
  'microsoft jhenghei', 'jhenghei', 'simsun', 'simhei', 'heiti', 'songti', 'hiragino',
];
// Han + kana ranges — used to decide whether a file actually contains CJK content
const CJK_CHAR_RE = /[㐀-鿿豈-﫿぀-ヿ]/;
const GENERICS = ['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui', 'ui-monospace', 'ui-serif', 'ui-sans-serif'];

export const dimension = {
  id: '04-font-family',
  label: 'Font family (3 canonical · + CJK fallback on CJK-bearing surfaces)',
  layer: 1,
  applicability: 'universal',
};

function checkValue(value, spec) {
  // Extract first family name (before comma), strip quotes
  const first = value.split(',')[0].trim().replace(/^["']|["']$/g, '').toLowerCase();
  // Allow: canonical name · CSS keyword · var()
  if (value.includes('var(')) return true;
  const keywords = ['inherit', 'initial', 'unset', 'revert', 'currentcolor'];
  if (keywords.includes(first)) return true;
  if (spec.font.set.has(first)) return true;
  return false;
}

function hasCjkFont(value) {
  const v = value.toLowerCase();
  return CJK_FONT_HINTS.some(h => v.includes(h));
}

// A literal stack that SHOULD carry a CJK fallback on a CJK-bearing surface:
// not var() (token-based stacks are trusted · the token owns the fallback chain),
// not a CSS keyword, and not a bare generic-only value (nothing to anchor a CJK fallback to).
function isLiteralStackNeedingCjk(value) {
  if (value.includes('var(')) return false;
  const first = value.split(',')[0].trim().replace(/^["']|["']$/g, '').toLowerCase();
  const keywords = ['inherit', 'initial', 'unset', 'revert', 'currentcolor'];
  if (keywords.includes(first)) return false;
  if (GENERICS.includes(first)) return false;
  return true;
}

function cjkViolation(file, i, col, valueLabel) {
  return {
    dimensionId: dimension.id,
    severity: 'P1',
    path: file.path,
    line: i + 1,
    col: col + 1,
    value: valueLabel.slice(0, 70),
    message: `CJK-bearing surface · font stack omits a CJK fallback (e.g. 'Microsoft YaHei') · Windows renders Simplified CN as Traditional`,
    suggestion: `add a CJK font first among fallbacks per design.md §3 "CJK / i18n font fallback" (or reference a var(--font-*) token that includes one)`,
  };
}

export function check(file, ctx) {
  const violations = [];
  const lines = file.stripped.split('\n');
  // CJK check is surface-modulated: only on profiles flagged requireCjkFallback AND files that actually contain CJK.
  const cjkRequired = !!(ctx.profile && ctx.profile.requireCjkFallback) && CJK_CHAR_RE.test(file.stripped);

  lines.forEach((line, i) => {
    let m;
    // CSS-style
    FONT_FAMILY_RE.lastIndex = 0;
    while ((m = FONT_FAMILY_RE.exec(line)) !== null) {
      const value = m[1].trim().replace(/\s*!important$/, '').trim();
      if (!checkValue(value, ctx.spec)) {
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
      } else if (cjkRequired && isLiteralStackNeedingCjk(value) && !hasCjkFont(value)) {
        violations.push(cjkViolation(file, i, m.index, `font-family: ${value}`));
      }
    }
    // JS-style (React inline style)
    JS_FONT_RE.lastIndex = 0;
    while ((m = JS_FONT_RE.exec(line)) !== null) {
      const value = m[1];
      if (!checkValue(`"${value}"`, ctx.spec)) {
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
      } else if (cjkRequired && isLiteralStackNeedingCjk(value) && !hasCjkFont(value)) {
        violations.push(cjkViolation(file, i, m.index, `fontFamily: '${value}'`));
      }
    }
  });
  return violations;
}
