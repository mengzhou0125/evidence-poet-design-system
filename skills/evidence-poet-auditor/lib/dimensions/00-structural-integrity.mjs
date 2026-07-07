// Dimension #0 · HTML structural integrity (Layer 0 · universal · HTML-only self-gated)
//
// WHY this dimension exists: dims #1-#12 are all CSS design-token compliance checks. NONE of
// them look at whether the HTML *structure* is valid. A file can be 100% token-compliant yet
// render as garbage if tags are unbalanced — the worked failure case was a
// review HTML where 16 <div>s were closed by </p>, producing infinite concentric nesting and a
// visually 100%-broken page, while the auditor happily reported only 41 token drifts and ZERO
// signal on the actual breakage. Unclosed / mismatched tags are a known high-frequency failure
// mode of AI-generated HTML. Broken render > wrong color, so these are P0.
//
// INVARIANT: pure stdlib · 0 npm deps (no puppeteer / no DOM parser). This is a tag push/pop
// balance checker + block-closed-by-mismatch detector, NOT a full HTML validator. It is tuned to
// be CONSERVATIVE: it must not false-positive on valid HTML that legitimately omits optional
// closing tags (</p>, </li>, </td>, ...). It fires only on the unambiguous breakage classes:
//   (a) a close tag with NO matching open tag anywhere on the stack  (stray close · e.g. </p>
//       arriving while only <div> is open — the exact worked-case signature)
//   (b) structural container elements (div/section/article/... ) left unclosed at EOF

// Elements that never have a closing tag (HTML void elements) — never pushed on the stack.
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link',
  'meta', 'param', 'source', 'track', 'wbr']);

// Elements whose end tag is OPTIONAL in the HTML spec — they can be implicitly closed by the
// start of a sibling or the end of their parent. We auto-pop these so their omission is not
// mistaken for breakage. (Conservative superset of the HTML "optional tag" rules.)
const OPTIONAL_CLOSE = new Set(['p', 'li', 'dd', 'dt', 'option', 'optgroup',
  'thead', 'tbody', 'tfoot', 'tr', 'td', 'th', 'caption', 'colgroup', 'rp', 'rt']);

// Structural container elements — if any of these is still open at EOF, the document is broken.
// (Non-container leftovers like a stray <span> are lower-signal; we report container leftovers.)
const CONTAINER = new Set(['html', 'head', 'body', 'div', 'section', 'article', 'main', 'header',
  'footer', 'nav', 'aside', 'ul', 'ol', 'table', 'form', 'figure', 'blockquote']);

export const dimension = {
  id: '00-structural-integrity',
  label: 'HTML structural integrity (tag balance)',
  layer: 0,
  applicability: 'universal',
};

// Blank out spans that must not be scanned for HTML tags (their contents are not markup) while
// preserving newlines so 1-based line numbers stay aligned. Covers <script>, <style>, HTML
// comments, CDATA, and doctype/PI.
function maskNonMarkup(html) {
  const blank = m => m.replace(/[^\n]/g, ' ');
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, blank)
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, blank)
    .replace(/<!--[\s\S]*?-->/g, blank)
    .replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, blank)
    .replace(/<!doctype[^>]*>/gi, blank)
    .replace(/<\?[\s\S]*?\?>/g, blank);
}

// Line number of a character offset (1-based).
function lineAt(text, index) {
  let line = 1;
  for (let i = 0; i < index && i < text.length; i++) if (text[i] === '\n') line++;
  return line;
}

export function check(file, ctx) {
  if (!file.path.endsWith('.html') && !file.path.endsWith('.htm')) return [];

  const text = maskNonMarkup(file.original);
  const violations = [];
  const stack = []; // { name, line }

  // Match start tags and end tags. Attribute values may contain '>' inside quotes only rarely in
  // practice; a P0 heuristic accepts that edge. Self-closing detected via trailing '/'.
  const TAG_RE = /<(\/)?([a-zA-Z][a-zA-Z0-9-]*)\b([^>]*)>/g;
  let m;
  while ((m = TAG_RE.exec(text)) !== null) {
    const isClose = !!m[1];
    const name = m[2].toLowerCase();
    const attrs = m[3] || '';
    const selfClosed = /\/\s*$/.test(attrs);
    const line = lineAt(text, m.index);

    if (VOID.has(name)) continue;        // void: no close expected
    if (!isClose && selfClosed) continue; // <foo /> : self-contained

    if (!isClose) {
      // Opening a sibling optional-close element implicitly closes the previous one of the same
      // name at the top of the stack (e.g. <li>..<li>).
      if (OPTIONAL_CLOSE.has(name) && stack.length && stack[stack.length - 1].name === name) {
        stack.pop();
      }
      stack.push({ name, line });
      continue;
    }

    // --- close tag ---
    // Find the nearest matching open tag on the stack.
    let idx = -1;
    for (let i = stack.length - 1; i >= 0; i--) {
      if (stack[i].name === name) { idx = i; break; }
    }

    if (idx === -1) {
      // No matching open ANYWHERE — stray close tag. This is the worked-case signature: </p>
      // closing a <div> when no <p> is open.
      const topOpen = stack.length ? stack[stack.length - 1].name : null;
      violations.push({
        dimensionId: dimension.id,
        severity: 'P0',
        path: file.path,
        line,
        col: 1,
        value: `</${name}>`,
        message: topOpen
          ? `stray </${name}> — no matching <${name}> is open (nearest open element is <${topOpen}>); this misnests and breaks rendering`
          : `stray </${name}> — no matching <${name}> is open`,
        suggestion: `remove </${name}> or add the matching <${name}>, or close <${topOpen || 'the open element'}> first`,
      });
      continue;
    }

    // Everything above idx is being implicitly closed by this close tag. If any of those are
    // NON-optional-close elements, that is a real misnesting; but to stay conservative we only
    // hard-flag when a non-optional CONTAINER is being skipped over (that is unambiguous breakage,
    // not spec-sanctioned optional-close). Optional-close elements above idx are popped silently.
    for (let i = stack.length - 1; i > idx; i--) {
      const skipped = stack[i];
      if (!OPTIONAL_CLOSE.has(skipped.name) && CONTAINER.has(skipped.name)) {
        violations.push({
          dimensionId: dimension.id,
          severity: 'P0',
          path: file.path,
          line,
          col: 1,
          value: `</${name}>`,
          message: `</${name}> closes across an unclosed <${skipped.name}> (opened line ${skipped.line}); <${skipped.name}> is never closed before </${name}> — misnested`,
          suggestion: `close <${skipped.name}> before </${name}>`,
        });
      }
    }
    stack.length = idx; // pop through the matched element (idx..end removed)
  }

  // Anything left open at EOF: report unclosed structural containers (high-signal breakage).
  for (const open of stack) {
    if (CONTAINER.has(open.name)) {
      violations.push({
        dimensionId: dimension.id,
        severity: 'P0',
        path: file.path,
        line: open.line,
        col: 1,
        value: `<${open.name}>`,
        message: `<${open.name}> opened at line ${open.line} is never closed (unbalanced at end of document)`,
        suggestion: `add the matching </${open.name}>`,
      });
    }
  }

  return violations;
}
