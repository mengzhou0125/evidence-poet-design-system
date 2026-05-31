// Dimension #9 · Shadow (hover-only by default · Layer 1)
// Best-effort: flag box-shadow declarations that are NOT inside :hover/:focus/active/featured contexts.
// Heuristic: walk preceding selector chain for any of {:hover, :focus-visible, .active, .featured, [data-active]}.

const SHADOW_RE = /(^|[^-])\bbox-shadow\s*:\s*([^;}\n]+)/gi;
const HOVER_TOKENS = [':hover', ':focus', ':focus-visible', '.active', '.is-active', '.featured', '.is-featured', '[data-active', '[aria-current'];

export const dimension = {
  id: '09-shadow',
  label: 'Shadow (hover/active state only · default flat)',
  layer: 1,
  applicability: 'universal',
};

// Find the selector that owns this declaration: walk backward through stripped text
// to find the nearest `{` and grab the selector before it.
function findOwningSelector(text, declOffset) {
  const braceIdx = text.lastIndexOf('{', declOffset);
  if (braceIdx === -1) return '';
  // Find previous `}` or start of file
  const prevEnd = Math.max(text.lastIndexOf('}', braceIdx), text.lastIndexOf(';', braceIdx));
  const selStart = prevEnd === -1 ? 0 : prevEnd + 1;
  return text.slice(selStart, braceIdx).trim();
}

export function check(file, ctx) {
  // Only CSS-like files
  if (!['.css', '.scss', '.html'].some(e => file.path.endsWith(e))) return [];

  const violations = [];
  const text = file.stripped;
  const lines = text.split('\n');
  // Walk char-by-char positions via global re on whole text to keep selector context
  let m;
  SHADOW_RE.lastIndex = 0;
  while ((m = SHADOW_RE.exec(text)) !== null) {
    const value = m[2].trim();
    // accept "none"
    if (/^none$/i.test(value)) continue;

    const selector = findOwningSelector(text, m.index);
    const hasHover = HOVER_TOKENS.some(tok => selector.includes(tok));
    if (hasHover) continue;

    // compute line/col
    const before = text.slice(0, m.index);
    const line = before.split('\n').length;
    const col = m.index - before.lastIndexOf('\n');

    violations.push({
      dimensionId: dimension.id,
      severity: 'P1',
      path: file.path,
      line, col,
      value: `box-shadow: ${value}`,
      message: `shadow on non-hover selector "${selector.slice(0, 60)}" · default state should be flat`,
      suggestion: 'move to :hover / :focus-visible / .active context, OR remove if decorative',
    });
  }
  return violations;
}
