// lib/spec.mjs — load canonical spec from design.md §0 JSON

import { readFileSync } from 'node:fs';

export function loadSpec(specPath) {
  let text;
  try { text = readFileSync(specPath, 'utf8'); }
  catch (e) { throw new Error(`Cannot read spec at ${specPath}: ${e.message}`); }

  const sec0 = text.split(/^##\s+0\b/m)[1];
  if (!sec0) throw new Error('design.md: ## 0 section not found');
  const m = sec0.match(/```json\n([\s\S]*?)\n```/);
  if (!m) throw new Error('design.md §0: ```json block not found');

  let json;
  try { json = JSON.parse(m[1]); }
  catch (e) { throw new Error(`design.md §0 JSON parse failed: ${e.message}`); }

  // Normalize: build derived sets that dimensions consume
  const colorSet = new Set();
  const colorMap = {};
  for (const [name, v] of Object.entries(json.color || {})) {
    const norm = normalizeColor(v);
    colorSet.add(norm);
    colorMap[norm] = name;
  }

  // Also extract rgba/hex from shadowHover (and any other top-level field that contains a color literal)
  // Example: "shadowHover": "0 2px 12px rgba(0,0,0,0.06)" — extract rgba(0,0,0,0.06)
  const COLOR_LITERAL_RE = /(#[0-9a-fA-F]{3,8}\b)|(rgba?\([^)]+\))|(hsla?\([^)]+\))/g;
  for (const [k, v] of Object.entries(json)) {
    if (k === 'color' || typeof v !== 'string') continue;
    const matches = v.match(COLOR_LITERAL_RE) || [];
    for (const m of matches) {
      const norm = normalizeColor(m);
      colorSet.add(norm);
      if (!colorMap[norm]) colorMap[norm] = k;
    }
  }

  // Fold GOVERNED extension namespaces into the canonical set. Any object-valued top-level
  // key (e.g. `promotedExtensions`) whose values are color literals holds sanctioned,
  // already-WCAG-vetted extension colors — dim #01 must NOT flag these as non-canonical,
  // regardless of which surface profile (if any) matched the file. Numeric object keys
  // (e.g. `durations`) are skipped because their values aren't color literals.
  for (const [k, v] of Object.entries(json)) {
    if (k === 'color' || k === 'font' || v === null || typeof v !== 'object' || Array.isArray(v)) continue;
    for (const [subname, subv] of Object.entries(v)) {
      if (typeof subv !== 'string') continue;
      const matches = subv.match(COLOR_LITERAL_RE) || [];
      for (const m of matches) {
        const norm = normalizeColor(m);
        colorSet.add(norm);
        if (!colorMap[norm]) colorMap[norm] = `${k}.${subname}`;
      }
    }
  }

  const fontSet = new Set();
  for (const v of Object.values(json.font || {})) {
    fontSet.add(v.toLowerCase());
  }

  const spacingSet = new Set((json.spacing || []).map(n => `${n}px`));
  // also accept rem equivalents (assume 16px base)
  for (const n of json.spacing || []) {
    spacingSet.add(`${(n / 16)}rem`);
  }
  spacingSet.add('0'); spacingSet.add('0px'); spacingSet.add('auto');

  return {
    raw: json,
    color: { set: colorSet, byName: json.color || {}, hexToName: colorMap },
    font: { set: fontSet, raw: json.font || {} },
    spacing: { set: spacingSet, raw: json.spacing || [] },
    easing: json.easing || '',
    borderRadius: json.borderRadius ?? 0,
    shadowHover: json.shadowHover || '',
  };
}

export function normalizeColor(v) {
  if (typeof v !== 'string') return '';
  let s = v.trim().toLowerCase();
  const short = s.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/);
  if (short) s = `#${short[1]}${short[1]}${short[2]}${short[2]}${short[3]}${short[3]}`;
  s = s.replace(/\s+/g, '');
  return s;
}
