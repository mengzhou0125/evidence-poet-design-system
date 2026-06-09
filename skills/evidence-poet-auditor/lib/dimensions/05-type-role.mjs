// Dimension #5 · Type role usage (Guardrail B · Layer 2 surface-modulated)
// Rule (from design.md §9-B):
//  - Serif (Playfair Display) → narrative authority — HEADINGS ONLY (h1-h4, .title, .heading)
//  - Sans (Plus Jakarta Sans) → readable body — PARAGRAPHS ONLY (p, .body, .description)
//  - Mono (DM Mono) → precise annotation — LABELS / NAV / CTA ONLY (.label, .nav, .cta, .tag, .caption)
//  - Reversing roles is a P0 violation.
//
// Strategy: for each CSS rule that sets `font-family: <canonical font>`, classify the selector by role.
// High-confidence selectors (deterministic mapping): h1-h4 = heading · p = body · etc → P0/P1 by mismatch.
// Ambiguous selectors → P2 "verify".

const FONT_FAMILY_RE = /font-family\s*:\s*([^;}\n]+)/gi;
const SERIF = 'playfair display';
const SANS = 'plus jakarta sans';
const MONO = 'dm mono';

// Role classification by selector pattern (longest-match first within each tier)
const ROLE_PATTERNS = {
  heading: [
    /\bh[1-4]\b/, /\.title\b/, /\.heading\b/, /\.hero__title\b/, /\.cs-hero__title\b/,
    /__title\b/, /__heading\b/, /\.display\b/, /\.section-title\b/,
  ],
  body: [
    /\bp\b(?!\s*[\.\:#])/, /\.body\b/, /\.description\b/, /__desc\b/, /__body\b/,
    /\.paragraph\b/, /\.text\b/, /\.content\b/, /\.lead\b/,
  ],
  label: [
    /\.label\b/, /\bnav\b/, /\.nav\b/, /\.cta\b/, /\.tag\b/, /\.caption\b/,
    /\.btn\b/, /\.button\b/, /\.menu\b/, /\.breadcrumb\b/, /\.badge\b/,
    /\.chip\b/, /__label\b/, /__nav\b/, /__cta\b/, /__caption\b/, /__tag\b/,
    /\bth\b/, // table headers often labels
  ],
};

function classifyRole(selector) {
  const s = selector.toLowerCase();
  // Test in priority order: heading > label > body (heading + label more specific than body)
  for (const role of ['heading', 'label', 'body']) {
    for (const re of ROLE_PATTERNS[role]) {
      if (re.test(s)) return role;
    }
  }
  return 'unknown';
}

function classifyFont(value) {
  const v = value.toLowerCase();
  if (v.includes(SERIF)) return 'serif';
  if (v.includes(SANS)) return 'sans';
  if (v.includes(MONO)) return 'mono';
  return 'other';
}

// font→role expected mapping
const EXPECTED = {
  serif: ['heading'],
  sans: ['body', 'unknown'], // body or generic
  mono: ['label'],
};

// Find owning selector by walking back through stripped text from the declaration position
function findOwningSelector(text, declOffset) {
  const braceIdx = text.lastIndexOf('{', declOffset);
  if (braceIdx === -1) return '';
  const prevEnd = Math.max(text.lastIndexOf('}', braceIdx), text.lastIndexOf(';', braceIdx));
  const selStart = prevEnd === -1 ? 0 : prevEnd + 1;
  return text.slice(selStart, braceIdx).trim();
}

export const dimension = {
  id: '05-type-role',
  label: 'Type role usage (Guardrail B · serif=heading · sans=body · mono=label/nav/CTA)',
  layer: 2,
  applicability: 'surface-modulated',
};

export function check(file, ctx) {
  // Only CSS-like contexts (CSS / SCSS / HTML inline styles)
  if (!/\.(css|scss|html)$/i.test(file.path)) return [];

  const violations = [];
  const text = file.stripped;

  let m;
  FONT_FAMILY_RE.lastIndex = 0;
  while ((m = FONT_FAMILY_RE.exec(text)) !== null) {
    const value = m[1];
    const font = classifyFont(value);
    if (font === 'other') continue; // covered by #04 font-family
    // Skip var() references — can't trace role from declared role
    if (value.includes('var(')) continue;

    const selector = findOwningSelector(text, m.index);
    const role = classifyRole(selector);

    // Compute line/col
    const before = text.slice(0, m.index);
    const line = before.split('\n').length;
    const col = m.index - before.lastIndexOf('\n');

    // Allow `:root` / `html` / `body` declarations as defaults — they set the inherit baseline
    if (/^(:root|html|body|\*)\s*$/.test(selector)) continue;

    const expected = EXPECTED[font];
    if (expected.includes(role)) continue; // OK

    // Mismatch
    let severity = 'P0';
    let message = `Guardrail B · ${font} font on ${role} selector "${selector.slice(0, 50)}" (expected: ${expected.join('/')})`;

    if (role === 'unknown') {
      severity = 'P2';
      message = `${font} font on unclassified selector "${selector.slice(0, 50)}" · verify role intent`;
    }

    violations.push({
      dimensionId: dimension.id,
      severity,
      path: file.path,
      line, col,
      value: `font-family: ${value.trim().slice(0, 40)}`,
      message,
      suggestion: role === 'unknown' ? null : `use ${expected[0]}-appropriate font (serif=heading · sans=body · mono=label)`,
    });
  }

  return violations;
}
