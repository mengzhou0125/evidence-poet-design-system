// Dimension #12 · Extension governance (Layer 3 · per-profile)
// Rules ROOTED in design.md §"Extension governance" 5 rules:
//  - allowedNamespaces (rule 1: namespace prefix mandatory)
//  - requireCommentPattern (rule 2: WCAG rationale inline for text-bearing colors)
//
// REMOVED 2026-05-25: tagOrthogonality check was here but the 9-color-orthogonal rule is a
// review-html BP convention (lives in `review_html_workflow.md`), NOT a design.md spec rule.
// Per spec §"Extension governance" rule 5 — cross-consumer convergence triggers promotion;
// 0 cross-consumer convergence promoted yet · so tag orthogonality stays in BP-side authority.
// Tag orthogonality enforcement moved to `evidence-poet-builder` skill (review-html scenario)
// where build-time pattern generation is the right authority for BP conventions.

import { normalizeColor } from '../spec.mjs';

const CSS_VAR_DEF_RE = /--([a-zA-Z0-9_-]+)\s*:\s*([^;}\n]+)/g;

export const dimension = {
  id: '12-extension-gov',
  label: 'Extension governance (per surface · namespace + comment + orthogonality)',
  layer: 3,
  applicability: 'surface-specific',
};

export function check(file, ctx) {
  const profile = ctx.profile;
  if (!profile || !profile.extensions) return [];
  const ext = profile.extensions;

  const violations = [];
  const text = file.stripped;
  const original = file.original; // for finding adjacent comments
  const lines = text.split('\n');

  // 1. CSS var namespace + WCAG comment check
  if (ext.allowedNamespaces && ext.allowedNamespaces.length > 0) {
    lines.forEach((line, i) => {
      let m;
      CSS_VAR_DEF_RE.lastIndex = 0;
      while ((m = CSS_VAR_DEF_RE.exec(line)) !== null) {
        const varName = `--${m[1]}`;
        const value = m[2].trim();

        // Skip canonical base CSS vars (those starting with --color-/--font-/--space-/etc.)
        // These are baseline tokens defined in theme files · not extensions
        const BASE_NAMESPACES = ['--color-', '--font-', '--font-size-', '--space-', '--duration-', '--ease-', '--radius-', '--shadow-'];
        const isBase = BASE_NAMESPACES.some(ns => varName.startsWith(ns));
        if (isBase) continue; // base tokens are governed by spec sync, not extension governance

        // Extension namespace check: must start with one of allowedNamespaces
        const isAllowed = ext.allowedNamespaces.some(ns => varName.startsWith(ns));
        if (!isAllowed) {
          // Only flag if value is a color (other extensions like --hairline: 1px are out of #12 scope)
          const isColorExt = /#[0-9a-f]{3,8}|rgb|hsl/i.test(value);
          if (isColorExt) {
            // Standalone single-file surfaces (profile.extensions.inlineBaseTokens) inline the base
            // palette with short names (--bg / --ink / --gold) instead of importing a theme file. A
            // token holding a CANONICAL spec color is a base token, not a rogue unnamespaced
            // extension — don't flag it (a real-world case · 16 P1 false-positives). Non-
            // canonical inline hex still flags (real drift · also caught by dim-01).
            if (ext.inlineBaseTokens && ctx.spec?.color?.set) {
              const hexM = value.match(/#[0-9a-fA-F]{3,8}/);
              if (hexM && ctx.spec.color.set.has(normalizeColor(hexM[0]))) continue;
            }
            violations.push({
              dimensionId: dimension.id,
              severity: 'P1',
              path: file.path,
              line: i + 1,
              col: m.index + 1,
              value: `${varName}: ${value.slice(0, 40)}`,
              message: `extension color ${varName} doesn't use allowed namespace [${ext.allowedNamespaces.join(', ')}]`,
              suggestion: `rename with one of the allowed namespace prefixes`,
            });
          }
          continue;
        }

        // Check WCAG comment requirement: only for color extensions in allowed namespace
        if (ext.requireCommentPattern && /color|bg|text|fill/i.test(varName) && /#[0-9a-f]{3,8}|rgb/i.test(value)) {
          // Look for comment on same line or within 2 lines above in ORIGINAL (with comments preserved)
          const orig = original.split('\n');
          const ctxLines = orig.slice(Math.max(0, i - 2), i + 1).join(' ');
          const re = new RegExp(ext.requireCommentPattern);
          if (!re.test(ctxLines)) {
            violations.push({
              dimensionId: dimension.id,
              severity: 'P1',
              path: file.path,
              line: i + 1,
              col: m.index + 1,
              value: varName,
              message: `extension color ${varName} missing required comment matching /${ext.requireCommentPattern}/`,
              suggestion: 'add WCAG ratio comment, e.g.  /* WCAG 4.6:1 white-on-this */',
            });
          }
        }
      }
    });
  }

  // 2. Tag orthogonality check — REMOVED per spec-rootedness invariant (2026-05-25 · Layer 2 BP review §X3).
  //    Was: review-html 9-color orthogonal tag check (single-profile)
  //    Removed because:
  //      (a) Rule lives in `review_html_workflow.md` BP doc · not in design.md spec
  //      (b) Per design.md §"Extension governance" rule 5 — needs promotion to spec before audit-enforce
  //      (c) BP now has TWO profiles (A editorial 3×4 · B technical 3×3×3 · per Layer 2 §X3 Option B) ·
  //          single profile check would be incorrect even if rule promoted
  //    BP-side enforcement: `evidence-poet-builder` skill review-html scenario generates correctly per chosen profile.
  //    Dead code from previous if-false guard cleaned up below — was confusing reader (per Layer 4 §5 P2).
  /* === intentionally empty · tag orthogonality NOT checked by auditor (dead code removed 2026-05-26 per Layer 4 §5 P2) === */

  return violations;
}
