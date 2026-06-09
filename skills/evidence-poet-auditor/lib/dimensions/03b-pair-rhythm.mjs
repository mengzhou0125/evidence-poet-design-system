// Dimension #3b · Spacing pair rhythm consistency (Layer 2 surface-modulated)
// Rule: when the same selector OR adjacent-sibling pair appears multiple times in a file with
// DIFFERENT gap values (margin-bottom/margin-top/padding-bottom/gap), the minority cluster = drift.
//
// Two collection strategies:
//  (a) Same-selector consistency: `.card-box { margin-bottom: 16px }` here · `.card-box { margin-bottom: 24px }` elsewhere
//  (b) Sibling-gap consistency: `.x + .x { margin-top: 16px }` here · `.x ~ .x { margin-top: 24px }` elsewhere

const SPACING_PROPS = ['margin', 'margin-top', 'margin-bottom', 'padding', 'padding-top', 'padding-bottom', 'gap', 'row-gap'];
const GAP_RE = new RegExp(`(?<![a-zA-Z-])(${SPACING_PROPS.join('|')})\\s*:\\s*([^;}\\n]+)`, 'gi');

// Selector normalization: strip `:hover`, `:focus-visible`, `> child`, `+`, `~` for grouping
function normalizeSelector(sel) {
  return sel.toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/:hover|:focus|:focus-visible|:active|:disabled|::before|::after/g, '')
    .replace(/\s*[>+~]\s*/g, ' COMBINATOR ') // preserve hierarchy signal but normalize
    .trim();
}

function findOwningSelector(text, declOffset) {
  const braceIdx = text.lastIndexOf('{', declOffset);
  if (braceIdx === -1) return '';
  const prevEnd = Math.max(text.lastIndexOf('}', braceIdx), text.lastIndexOf(';', braceIdx));
  const selStart = prevEnd === -1 ? 0 : prevEnd + 1;
  return text.slice(selStart, braceIdx).trim();
}

export const dimension = {
  id: '03b-pair-rhythm',
  label: 'Spacing pair rhythm (same selector + property should have same gap across file)',
  layer: 2,
  applicability: 'surface-modulated',
};

export function check(file, ctx) {
  if (!/\.(css|scss|html)$/i.test(file.path)) return [];

  // Collect: map<(selector + property), [{value, line, col}]>
  const groups = new Map();
  const text = file.stripped;

  let m;
  GAP_RE.lastIndex = 0;
  while ((m = GAP_RE.exec(text)) !== null) {
    const prop = m[1].toLowerCase();
    let value = m[2].trim().replace(/\s*!important$/, '').trim();
    // strip surrounding `;` `,`
    value = value.replace(/[;,]+$/, '').trim();
    // skip non-numeric (auto/inherit/var)
    if (!/\d/.test(value) || value.startsWith('var(') || value.startsWith('calc(')) continue;

    const selector = findOwningSelector(text, m.index);
    if (!selector) continue;
    const norm = normalizeSelector(selector);
    if (!norm) continue;

    const key = `${norm} ::: ${prop}`;
    const before = text.slice(0, m.index);
    const line = before.split('\n').length;
    const col = m.index - before.lastIndexOf('\n');

    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push({ value, line, col, prop, selector });
  }

  // For each group with >1 distinct value: minority entries are drift
  const violations = [];
  for (const [key, entries] of groups.entries()) {
    if (entries.length < 2) continue;
    const valueCounts = {};
    for (const e of entries) valueCounts[e.value] = (valueCounts[e.value] || 0) + 1;
    const distinct = Object.keys(valueCounts);
    if (distinct.length < 2) continue; // all same · OK

    // Identify majority value · everything else is drift
    const sorted = distinct.sort((a, b) => valueCounts[b] - valueCounts[a]);
    const majority = sorted[0];
    const majorityCount = valueCounts[majority];

    for (const e of entries) {
      if (e.value === majority) continue;
      violations.push({
        dimensionId: dimension.id,
        severity: 'P1',
        path: file.path,
        line: e.line,
        col: e.col,
        value: `${e.prop}: ${e.value}`,
        message: `rhythm drift · selector "${e.selector.slice(0, 40)}" uses ${e.value} but majority (${majorityCount}/${entries.length}) uses ${majority}`,
        suggestion: `align to ${majority} OR justify the difference`,
      });
    }
  }

  return violations;
}
