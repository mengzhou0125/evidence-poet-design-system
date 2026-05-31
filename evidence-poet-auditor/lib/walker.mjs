// lib/walker.mjs — file walk + comment stripping

import { readdirSync, statSync, readFileSync } from 'node:fs';
import { join, extname } from 'node:path';

const TARGET_EXT = new Set(['.css', '.scss', '.tsx', '.ts', '.jsx', '.js', '.html', '.svg']);
const IGNORE_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.next', '_archive', '_frozen', '.cache', 'coverage']);

export function walk(p, out = []) {
  const st = statSync(p);
  if (st.isFile()) {
    if (TARGET_EXT.has(extname(p))) out.push(p);
    return out;
  }
  for (const name of readdirSync(p)) {
    if (IGNORE_DIRS.has(name) || name.startsWith('.')) continue;
    walk(join(p, name), out);
  }
  return out;
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
