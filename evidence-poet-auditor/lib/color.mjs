// lib/color.mjs — color utilities

export const COLOR_RE = /(#[0-9a-fA-F]{3,8}\b)|(rgba?\([^)]+\))|(hsla?\([^)]+\))/g;

export function hexToRgb(h) {
  const m = h.match(/^#([0-9a-f]{6})$/i);
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function nearestCanonical(value, canonSet) {
  const v = hexToRgb(value);
  if (!v) return null;
  let best = null, bestD = Infinity;
  for (const c of canonSet) {
    const cv = hexToRgb(c);
    if (!cv) continue;
    const d = (v[0]-cv[0])**2 + (v[1]-cv[1])**2 + (v[2]-cv[2])**2;
    if (d < bestD) { bestD = d; best = c; }
  }
  return best === null ? null : { value: best, distance: Math.sqrt(bestD) };
}

// Detect line/col for each match — returns array of {raw, normalized, line, col}
export function scanColors(strippedText, normalize) {
  const out = [];
  const lines = strippedText.split('\n');
  lines.forEach((line, i) => {
    let m;
    COLOR_RE.lastIndex = 0;
    while ((m = COLOR_RE.exec(line)) !== null) {
      const raw = m[0];
      const norm = normalize(raw);
      // Skip 4/8-char hex (with alpha) — not in §0 base palette, allowed in extensions
      if (/^#[0-9a-f]{4}$/i.test(norm) || /^#[0-9a-f]{8}$/i.test(norm)) continue;
      out.push({ raw, normalized: norm, line: i + 1, col: m.index + 1 });
    }
  });
  return out;
}
