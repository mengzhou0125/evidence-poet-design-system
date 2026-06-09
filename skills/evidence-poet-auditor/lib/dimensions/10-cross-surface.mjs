// Dimension #10 · Cross-surface consistency (Layer 3 · post-file-pass · subsumes sync-tokens.mjs)
// For each canonical §0 JSON token, scan known consumer files for its expected presence + value.
// Flag: missing token, value mismatch, or stale/drifted alternative.
//
// "Known consumers" come from spec.consumers (declared in design.md §0 JSON sync-section, or default list).
// Default consumer list mirrors current sync-tokens.mjs §"4 token-holding consumers".

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { normalizeColor } from '../spec.mjs';

export const dimension = {
  id: '10-cross-surface',
  label: 'Cross-surface consistency (canonical tokens propagated to all known consumers)',
  layer: 3,
  applicability: 'cross-surface', // runs once after individual file passes, not per-file
  isAggregator: true, // signal to orchestrator
};

// Default consumer list · ILLUSTRATIVE PLACEHOLDER ONLY (no real paths shipped).
// This skill ships with NO built-in consumers. To run the cross-surface check, declare
// your project's token-holding consumer files via either:
//   (a) `consumers` array in design.md §0 JSON (preferred · canonical · travels with the spec)
//   (b) `--consumers=<path-to-json>` CLI flag
// The single placeholder below is `optional`, so an unconfigured run skips silently
// (no false "consumer missing" warning) rather than checking anything real.
//
// Schema per consumer:
//   name              · human-readable label for report
//   path              · relative to project root (resolved via resolveProjectRoot)
//   type              · 'css-vars' | 'markdown-table' | 'inline-css-vars'
//   expectedMapping   · which subset of §0 tokens consumer holds
//   optional          · skip with warning if file missing (default false)
//   extensionAllowed  · consumer may contain --review-* / --severity-* extension hexes
//                       per spec §"Extension governance" rule 4 · reverse drift check suppressed
const DEFAULT_CONSUMERS = [
  {
    name: 'theme.css (example)',
    path: 'src/styles/theme.css',
    type: 'css-vars',
    expectedMapping: 'full base palette',
    optional: true,
    extensionAllowed: false,
  },
];

// Project root resolution: walk up from the spec path to the nearest directory that looks
// like a project root (contains `.git` or `.claude`). Consumer paths resolve relative to it.
function resolveProjectRoot(specPath) {
  let dir = dirname(resolve(specPath));
  for (let i = 0; i < 8; i++) {
    if (existsSync(resolve(dir, '.git')) || existsSync(resolve(dir, '.claude'))) return dir;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

// Check function · called by orchestrator AFTER all per-file passes
// ctx.allViolations = violations collected so far (we don't add to that · we return our own)
export function check(_file, ctx) {
  // No-op when called per-file · we only act in aggregate mode
  return [];
}

// Aggregate run · called once at end by orchestrator
export function aggregate(ctx) {
  const { spec, specPath } = ctx;
  const violations = [];
  const projectRoot = resolveProjectRoot(specPath);
  if (!projectRoot) {
    return [{
      dimensionId: dimension.id,
      severity: 'P2',
      path: '(project)',
      line: 0, col: 0,
      value: '',
      message: `cannot resolve project root from spec path · cross-surface check skipped`,
      suggestion: null,
    }];
  }

  const consumers = (spec.raw.consumers && Array.isArray(spec.raw.consumers))
    ? spec.raw.consumers : DEFAULT_CONSUMERS;

  for (const consumer of consumers) {
    const fullPath = resolve(projectRoot, consumer.path);
    if (!existsSync(fullPath)) {
      if (!consumer.optional) {
        violations.push({
          dimensionId: dimension.id,
          severity: 'P1',
          path: consumer.path,
          line: 0, col: 0,
          value: '',
          message: `expected consumer missing · ${consumer.name}`,
          suggestion: `create or update consumer · or mark consumer as optional in spec`,
        });
      }
      continue;
    }
    const text = readFileSync(fullPath, 'utf8');

    // Build normalized hex set from consumer file (handles #555 vs #555555 + case variants)
    const COLOR_LITERAL_RE = /(#[0-9a-fA-F]{3,8}\b)|(rgba?\([^)]+\))|(hsla?\([^)]+\))/g;
    const consumerHexSet = new Set();
    let cm;
    while ((cm = COLOR_LITERAL_RE.exec(text)) !== null) {
      consumerHexSet.add(normalizeColor(cm[0]));
    }

    // Forward check: for each canonical token, verify presence in consumer (after normalization)
    for (const [name, hex] of Object.entries(spec.color.byName)) {
      const normCanonical = normalizeColor(hex);
      if (consumerHexSet.has(normCanonical)) continue;
      // Token not found · possible drift OR consumer is base-subset scope
      violations.push({
        dimensionId: dimension.id,
        severity: 'P2',
        path: consumer.path,
        line: 0, col: 0,
        value: `${name} = ${hex}`,
        message: `canonical token ${name} (${hex}) not found in ${consumer.name}`,
        suggestion: `if consumer is base-subset scope, mark optional · else add/align`,
      });
    }

    // Reverse check: scan consumer for hex literals NOT in canonical (drift)
    // Skip for extension-allowed consumers · they're expected to host non-canonical extension tokens
    if (consumer.extensionAllowed) continue;
    const HEX_LITERAL_RE = /#[0-9a-fA-F]{6}\b/g;
    const seenHexes = new Set();
    let m;
    while ((m = HEX_LITERAL_RE.exec(text)) !== null) {
      seenHexes.add(m[0].toLowerCase());
    }
    for (const consumerHex of seenHexes) {
      if (!spec.color.set.has(consumerHex)) {
        violations.push({
          dimensionId: dimension.id,
          severity: 'P1',
          path: consumer.path,
          line: 0, col: 0,
          value: consumerHex,
          message: `consumer ${consumer.name} has non-canonical hex ${consumerHex} not in spec §0`,
          suggestion: `align to canonical or document as extension (per §"Extension governance")`,
        });
      }
    }
  }

  return violations;
}
