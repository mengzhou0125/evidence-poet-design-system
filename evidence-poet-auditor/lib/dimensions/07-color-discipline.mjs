// Dimension #7 · Color discipline (Guardrail C · Layer 1)
// Rules:
//  - Gold (#C8A84B) MUST NOT be used as text color (fails WCAG 2.14:1)
//  - Sub-#717171 grays (lighter than #717171) MUST NOT be used as body text color
//  - Detection: any "color: <hex>" declaration whose hex matches forbidden set

import { hexToRgb } from '../color.mjs';
import { normalizeColor } from '../spec.mjs';

const GOLD = '#c8a84b';
const GRAY_FLOOR_LUMA = 0.16; // #717171 sRGB-relative luminance ~0.16; lighter grays exceed this

// Match: color: <value> · NOT background-color · NOT border-color · NOT outline-color
const COLOR_PROP_RE = /(^|[^-])\bcolor\s*:\s*([^;}\n]+)/gi;
const HEX_RE = /#[0-9a-fA-F]{3,8}\b/g;

export const dimension = {
  id: '07-color-discipline',
  label: 'Color discipline (Guardrail C · no gold-as-text · no sub-#717171 grays)',
  layer: 1,
  applicability: 'universal',
};

function relLuma(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const [r, g, b] = rgb.map(c => {
    const x = c / 255;
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function isGrayish(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;
  const [r, g, b] = rgb;
  // approximate gray if R,G,B within 8 of each other
  return Math.abs(r - g) < 8 && Math.abs(g - b) < 8 && Math.abs(r - b) < 8;
}

export function check(file, ctx) {
  const violations = [];
  const lines = file.stripped.split('\n');
  lines.forEach((line, i) => {
    let m;
    COLOR_PROP_RE.lastIndex = 0;
    while ((m = COLOR_PROP_RE.exec(line)) !== null) {
      const value = m[2];
      const hexes = value.match(HEX_RE) || [];
      for (const h of hexes) {
        const norm = normalizeColor(h);
        // Skip 4/8-char alpha hex
        if (/^#[0-9a-f]{4}$/i.test(norm) || /^#[0-9a-f]{8}$/i.test(norm)) continue;

        // Gold-as-text check
        if (norm === GOLD) {
          violations.push({
            dimensionId: dimension.id,
            severity: 'P0',
            path: file.path,
            line: i + 1,
            col: m.index + 1,
            value: `color: ${h}`,
            message: `Guardrail C · gold #C8A84B as text fails WCAG (2.14:1)`,
            suggestion: 'use #1A1A18 (ink) or #527590 (cool blue-gray for links)',
          });
          continue;
        }

        // Sub-#717171 gray for body text check
        // Exempt: pure white (#FFFFFF · cardBg in §0) — intentional inverse text on dark BG (badges, etc.)
        // Exempt: #F8F7F3 (warmPaper) — same logic
        // Floor only catches mid-grays that are TOO LIGHT for body text on paper bg
        if (isGrayish(norm) && norm !== '#ffffff' && norm !== '#f8f7f3') {
          const luma = relLuma(norm);
          // Only flag mid-grays (luma 0.16-0.85): too light for paper but not clearly inverse
          if (luma !== null && luma > GRAY_FLOOR_LUMA && luma < 0.85) {
            violations.push({
              dimensionId: dimension.id,
              severity: 'P0',
              path: file.path,
              line: i + 1,
              col: m.index + 1,
              value: `color: ${h}`,
              message: `Guardrail C · gray ${h} lighter than #717171 floor fails WCAG for body text on paper`,
              suggestion: 'use #717171 or darker (#666 / #555 / #1A1A18)',
            });
          }
        }
      }
    }
  });
  return violations;
}
