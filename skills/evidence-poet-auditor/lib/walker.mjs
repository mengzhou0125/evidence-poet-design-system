// lib/walker.mjs — file walk + comment stripping

import { readdirSync, statSync, readFileSync } from 'node:fs';
import { join, extname, dirname, resolve } from 'node:path';

const TARGET_EXT = new Set(['.css', '.scss', '.tsx', '.ts', '.jsx', '.js', '.html', '.svg']);
const IGNORE_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.next', '_archive', '_frozen', '.cache', 'coverage']);

export function walk(p, out = [], isTopLevel = true) {
  const st = statSync(p);
  if (st.isFile()) {
    if (TARGET_EXT.has(extname(p))) {
      out.push(p);
      // When a single HTML file is the explicit audit target, follow its
      // <link href> / <script src> to LOCAL assets so the linked CSS/JS get
      // audited too. Without this, auditing a lone .html whose styles live in
      // external CSS walks almost nothing → a hollow "0 violations" pass.
      // Guarded by isTopLevel so directory walks (where the CSS is already
      // enumerated) don't double-add or pull in far-away shared themes.
      if (isTopLevel && extname(p) === '.html') {
        for (const asset of linkedAssets(p)) {
          if (!out.includes(asset)) out.push(asset);
        }
      }
    }
    return out;
  }
  for (const name of readdirSync(p)) {
    if (IGNORE_DIRS.has(name) || name.startsWith('.')) continue;
    walk(join(p, name), out, false);
  }
  return out;
}

// Resolve local stylesheet/script assets referenced from an HTML file.
// Skips remote URLs (http/https/protocol-relative), data: URIs, and missing
// files. Ext filter keeps it to auditable assets (a rel="icon" .ico is dropped
// here, so no need to parse the rel attribute).
function linkedAssets(htmlPath) {
  const dir = dirname(htmlPath);
  let html;
  try { html = readFileSync(htmlPath, 'utf8'); } catch { return []; }
  const refs = [];
  const patterns = [
    /<link\b[^>]*\bhref\s*=\s*["']([^"']+)["'][^>]*>/gi,
    /<script\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/gi,
  ];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(html)) !== null) {
      const href = m[1].trim();
      if (!href || /^(https?:)?\/\//i.test(href) || href.startsWith('data:')) continue;
      const clean = href.split('?')[0].split('#')[0];
      const target = resolve(dir, clean);
      if (!TARGET_EXT.has(extname(target))) continue;
      try { if (statSync(target).isFile()) refs.push(target); } catch { /* missing → skip */ }
    }
  }
  return refs;
}

// Strip comment content (replace with spaces · preserve column positions).
// Handles: /* ... */ (CSS/JS/SCSS multi-line) · <!-- ... --> (HTML/SVG) · // ... (JS line)
export function stripComments(text) {
  let s = text;
  s = s.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '));
  s = s.replace(/<!--[\s\S]*?-->/g,    m => m.replace(/[^\n]/g, ' '));
  s = s.replace(/(^|[^:])\/\/[^\n]*/g, (m, p1) => p1 + ' '.repeat(m.length - p1.length));
  return s;
}

export function readFile(path) {
  return readFileSync(path, 'utf8');
}

// Detect a (best-effort) language tag for a file based on extension.
export function langOf(path) {
  const e = extname(path);
  if (e === '.tsx' || e === '.jsx' || e === '.ts' || e === '.js') return 'js';
  if (e === '.css' || e === '.scss') return 'css';
  if (e === '.html') return 'html';
  if (e === '.svg') return 'svg';
  return 'unknown';
}
