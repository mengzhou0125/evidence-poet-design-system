// Dimension #11 · WCAG contrast (Layer 2 surface-modulated · STATIC subset)
// Static approach: for each CSS rule that sets BOTH `color:` AND `background:` (or `background-color:`),
// resolve CSS vars to root values, compute WCAG contrast ratio, flag if below 4.5:1 (normal text) or 3:1 (large).
//
// Limitations (genuinely require runtime):
//  - inherited bg from parent (not declared on same selector)
//  - text on image / gradient bg
//  - dynamic state changes (focus rings, hover bg)
// → Covered: direct color+bg pairs on same selector + body/global defaults.
// → Not covered: deeply inherited contexts. Reported as "scope: same-selector only".

import { hexToRgb } from '../color.mjs';
import { normalizeColor } from '../spec.mjs';

const RULE_RE = /([^{}]+)\{([^{}]+)\}/g;
const COLOR_DECL_RE = /(^|[^-])\bcolor\s*:\s*([^;}\n]+)/i;
const BG_DECL_RE = /\bbackground(?:-color)?\s*:\s*([^;}\n]+)/i;
const FONT_SIZE_DECL_RE = /\bfont-size\s*:\s*([^;}\n]+)/i;
const FONT_WEIGHT_DECL_RE = /\bfont-weight\s*:\s*([^;}\n]+)/i;
const HEX_RE = /#[0-9a-fA-F]{3,8}\b/g;
const VAR_RE = /var\(\s*(--[a-zA-Z0-9_-]+)/;

export const dimension = {
  id: '11-wcag-contrast',
  label: 'WCAG contrast (static · same-selector color+bg pairs only)',
  layer: 2,
  applicability: 'surface-modulated',
};

function relLuma(rgb) {
  const [r, g, b] = rgb.map(c => {
    const x = c / 255;
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(rgb1, rgb2) {
  const l1 = relLuma(rgb1);
  const l2 = relLuma(rgb2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Build a quick CSS-var registry from spec.color.byName + scan file for `--<name>: <hex>`
function buildVarRegistry(spec, text) {
  const reg = {};
  // Spec base vars: map --color-<name> → hex (best-effort, common convention)
  for (const [name, hex] of Object.entries(spec.color.byName || {})) {
    // theme-evidence-poet.css typically uses --color-bg, --color-ink, --color-accent etc · we don't know exact names
    // Fall back to direct registry from file definitions only
  }
  // Scan file for `--name: <hex>` and `--name: var(--other)`
  const VAR_DEF_RE = /--([a-zA-Z0-9_-]+)\s*:\s*([^;}\n]+)/g;
  let m;
  while ((m = VAR_DEF_RE.exec(text)) !== null) {
    const name = `--${m[1]}`;
    const value = m[2].trim();
    reg[name] = value;
  }
  return reg;
}

// Resolve a value string to a hex if possible (1 level of var() deref)
function resolveColor(value, varReg, depth = 0) {
  if (depth > 5) return null;
  value = value.trim();
  // Direct hex?
  const hexMatch = value.match(HEX_RE);
  if (hexMatch) {
    const norm = normalizeColor(hexMatch[0]);
    if (/^#[0-9a-f]{6}$/i.test(norm)) return norm;
  }
  // rgba/rgb · pull RGB only (ignore alpha for contrast — close enough)
  const rgbMatch = value.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]), g = parseInt(rgbMatch[2]), b = parseInt(rgbMatch[3]);
    return `#${[r, g, b].map(n => n.toString(16).padStart(2, '0')).join('')}`;
  }
  // var() reference?
  const varMatch = value.match(VAR_RE);
  if (varMatch) {
    const refName = varMatch[1];
    if (varReg[refName]) return resolveColor(varReg[refName], varReg, depth + 1);
  }
  return null;
}

function parsePx(value) {
  const m = String(value).match(/(\d+(?:\.\d+)?)\s*(px|rem|em)/);
  if (!m) return null;
  const n = parseFloat(m[1]);
  if (m[2] === 'px') return n;
  if (m[2] === 'rem' || m[2] === 'em') return n * 16;
  return null;
}

export function check(file, ctx) {
  if (!/\.(css|scss|html)$/i.test(file.path)) return [];

  const text = file.stripped;
  const varReg = buildVarRegistry(ctx.spec, text);

  const violations = [];
  let m;
  RULE_RE.lastIndex = 0;
  while ((m = RULE_RE.exec(text)) !== null) {
    const selector = m[1].trim();
    const body = m[2];

    // Skip top-level :root / html / body var-only rules
    if (/^(:root|html|\*)\s*$/.test(selector)) continue;

    const colorM = COLOR_DECL_RE.exec(body);
    const bgM = BG_DECL_RE.exec(body);
    if (!colorM || !bgM) continue;

    const fg = resolveColor(colorM[2], varReg);
    const bg = resolveColor(bgM[1], varReg);
    if (!fg || !bg) continue;

    const fgRgb = hexToRgb(fg);
    const bgRgb = hexToRgb(bg);
    if (!fgRgb || !bgRgb) continue;

    const ratio = contrastRatio(fgRgb, bgRgb);

    // Determine size threshold
    const fontSizeM = FONT_SIZE_DECL_RE.exec(body);
    const fontWeightM = FONT_WEIGHT_DECL_RE.exec(body);
    const px = fontSizeM ? parsePx(fontSizeM[1]) : null;
    const weight = fontWeightM ? parseInt(fontWeightM[1]) : 400;
    const isLargeText = px !== null && (px >= 24 || (px >= 18.66 && weight >= 700));
    const threshold = isLargeText ? 3.0 : 4.5;

    if (ratio >= threshold) continue;

    // Compute line/col
    const before = text.slice(0, m.index);
    const line = before.split('\n').length;
    const col = m.index - before.lastIndexOf('\n');

    violations.push({
      dimensionId: dimension.id,
      severity: 'P0',
      path: file.path,
      line, col,
      value: `${fg} on ${bg} = ${ratio.toFixed(2)}:1`,
      message: `WCAG contrast fail · "${selector.slice(0, 40)}" text/bg ratio ${ratio.toFixed(2)}:1 below ${threshold}:1 (${isLargeText ? 'large' : 'normal'} text)`,
      suggestion: `darken text or lighten bg to reach ≥${threshold}:1`,
    });
  }

  return violations;
}
