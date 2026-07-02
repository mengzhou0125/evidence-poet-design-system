#!/usr/bin/env node
// evidence-poet-auditor · multi-phase orchestrator
// Module: ESM-only (.mjs) · top-level await · do NOT require() via CommonJS
//
// Phases SHIPPED (v0.4 · 2026-05-25):
//   1   · Hex literal canonical                  (Layer 1 · universal · dim #1)
//   1.5 · Surface profile system + detection     (architecture · 4 profiles)
//   2   · Guardrails A/C/D                       (Layer 1 · dim #6 #7 #8 #9)
//   3   · Spacing scale + Font family            (Layer 1 · dim #3a #4)
//   3.5 · Spacing pair rhythm                    (Layer 2 · dim #3b)
//   4   · Type role usage                        (Layer 2 · dim #5 · best-effort static)
//   5   · WCAG contrast (static subset)          (Layer 2 · dim #11 · same-selector pairs)
//   6   · Cross-surface · subsumes sync-tokens   (Layer 3 · dim #10 · aggregator)
//   7   · Extension governance                   (Layer 3 · dim #12 · per-profile)
//   8   · Output formats (terminal · json · html) + --define-profile interactive flow
//
// Genuinely deferred (with reasoning):
//   3c  · Density floor                          (requires runtime headless browser · 0-deps invariant)
//   8.5 · nightly_audit.sh integration           (operational · per user direction)
//
// Usage:
//   node audit.mjs <path-to-audit> [options]
// Options:
//   --spec=<path>                  Path to design.md (default: ./.claude/design.md in cwd)
//   --profiles=<dir>               Path to surface-profiles/ (default: ./surface-profiles)
//   --format=terminal|json|html|summary   Output format (default: terminal)
//                                  summary = plain-language, no color · for CI logs / humans
//   --surface=<name>               Force a specific surface profile (skip detection)
//   --auto-classify                On unknown surface, auto-classify by content sniff
//   --strict-unknown               On unknown surface, run Layer 1+2 strictly, flag all extensions
//   --dimensions=<id,id,...>       Only run specific dimensions (warns on unknown ids)
//   --skip=<id,id,...>             Skip specific dimensions
//   --define-profile=<name>        Interactive Q&A to author new surface-profiles/<name>.json
//   --quiet                        Silent on a clean pass (no output, exit 0) · FAIL still prints.
//                                  Used by the per-session self-check so the happy path is silent.
//   --fix                          Review-gate auto-fix · DRY-RUN by default (prints a diff, writes
//                                  nothing). Only high-certainty drifts (01-hex Δ≤2 · 08-easing);
//                                  structural/ambiguous findings stay report-only.
//   --apply                        With --fix: actually write the proposed changes to disk.
// Exit codes:
//   0 · pass (no P0/P1; P2-only passes) · also: successful --fix dry-run/apply
//   1 · P1 violations only (CI: should fix)
//   2 · setup error (spec missing, bad args, file walk fails) · also: --fix write failure
//   3 · P0 violations present (CI: must fix · differentiated from P1 for blocking-gate logic)

import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadSpec } from './lib/spec.mjs';
import { walk, stripComments, readFile } from './lib/walker.mjs';
import { loadProfiles, detectProfile, autoClassify } from './lib/profile.mjs';
import { reportTerminal, reportJSON, reportHTML, reportSummary, reportFix } from './lib/report.mjs';
import { runFixes } from './lib/fix.mjs';

// All dimension modules
import * as dim01 from './lib/dimensions/01-hex-canonical.mjs';
import * as dim03a from './lib/dimensions/03a-spacing-scale.mjs';
import * as dim03b from './lib/dimensions/03b-pair-rhythm.mjs';
import * as dim04 from './lib/dimensions/04-font-family.mjs';
import * as dim05 from './lib/dimensions/05-type-role.mjs';
import * as dim06 from './lib/dimensions/06-border-radius.mjs';
import * as dim07 from './lib/dimensions/07-color-discipline.mjs';
import * as dim08 from './lib/dimensions/08-motion-easing.mjs';
import * as dim09 from './lib/dimensions/09-shadow.mjs';
import * as dim10 from './lib/dimensions/10-cross-surface.mjs';
import * as dim11 from './lib/dimensions/11-wcag-contrast.mjs';
import * as dim12 from './lib/dimensions/12-extension-gov.mjs';
import { defineProfile } from './lib/define-profile.mjs';

const ALL_DIMENSIONS = [dim01, dim03a, dim03b, dim04, dim05, dim06, dim07, dim08, dim09, dim10, dim11, dim12];

// ---------- arg parse ----------
const args = process.argv.slice(2);
const targetPath = args.find(a => !a.startsWith('--'));
const opts = {};
for (const a of args) {
  if (!a.startsWith('--')) continue;
  const [k, v] = a.slice(2).split('=');
  opts[k] = v === undefined ? true : v;
}
if (!targetPath) {
  console.error('Usage: node audit.mjs <path-to-audit> [--format=terminal|json|html|summary] [--spec=<path>] [...]');
  process.exit(2);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const specPath = opts.spec || resolve(process.cwd(), '.claude/design.md');
const profilesDir = opts.profiles || join(__dirname, 'surface-profiles');
const format = opts.format || 'terminal';

// --define-profile=<name> · interactive flow · no audit run
if (opts['define-profile']) {
  await defineProfile(opts['define-profile'], profilesDir);
  process.exit(0);
}

// ---------- load spec + profiles ----------
let spec, profiles;
try {
  spec = loadSpec(specPath);
} catch (e) {
  console.error(`Spec load failed: ${e.message}`);
  process.exit(2);
}
profiles = loadProfiles(profilesDir);

// ---------- resolve dimensions to run ----------
const ALL_DIM_IDS = ALL_DIMENSIONS.map(d => d.dimension.id);
let dimensions = ALL_DIMENSIONS;
if (opts.dimensions) {
  const ids = opts.dimensions.split(',');
  const unknown = ids.filter(id => !ALL_DIM_IDS.includes(id));
  if (unknown.length) {
    console.error(`Warning · unknown dim id(s) in --dimensions: ${unknown.join(', ')} (silently skipped). Valid: ${ALL_DIM_IDS.join(', ')}`);
  }
  dimensions = ALL_DIMENSIONS.filter(d => ids.includes(d.dimension.id));
}
if (opts.skip) {
  const ids = opts.skip.split(',');
  const unknown = ids.filter(id => !ALL_DIM_IDS.includes(id));
  if (unknown.length) {
    console.error(`Warning · unknown dim id(s) in --skip: ${unknown.join(', ')} (silently skipped). Valid: ${ALL_DIM_IDS.join(', ')}`);
  }
  dimensions = dimensions.filter(d => !ids.includes(d.dimension.id));
}

// ---------- walk target ----------
const absTarget = resolve(targetPath);
let files;
try { files = walk(absTarget); }
catch (e) { console.error(`Cannot walk target: ${e.message}`); process.exit(2); }

// ---------- audit each file ----------
const allViolations = [];
const profilesByFile = {};
let caughtDimErrors = 0;  // track silent-swallow caught errors · used in exit logic

for (const path of files) {
  const original = readFile(path);
  const stripped = stripComments(original);

  // Detect surface profile
  let detected;
  if (opts.surface) {
    const forced = profiles.find(p => p.name === opts.surface);
    detected = forced ? { profile: forced, confidence: 1, hits: 0, forced: true } : null;
  } else {
    detected = detectProfile(path, original, profiles);
    if (!detected && opts['auto-classify']) {
      detected = autoClassify(path, original, profiles);
    }
  }
  const profile = detected ? detected.profile : null;
  profilesByFile[path] = profile
    ? `${profile.label}${detected.confidence !== undefined ? ` (${(detected.confidence * 100).toFixed(0)}%)` : ''}`
    : '(unknown surface)';

  const file = { path, original, stripped };

  // Run dimensions in layer order
  for (const d of dimensions) {
    // Skip aggregator dims in per-file loop (they run once after all files)
    if (d.dimension.isAggregator) continue;
    // Layer applicability:
    //  - universal: always run
    //  - surface-modulated: always run (uses profile if available, defaults otherwise)
    //  - surface-specific: ONLY run if profile detected OR --strict-unknown
    if (d.dimension.applicability === 'surface-specific') {
      if (!profile && !opts['strict-unknown']) continue;
    }
    const ctx = { spec, profile, allProfiles: profiles, opts };
    try {
      const vs = d.check(file, ctx);
      for (const v of vs) allViolations.push(v);
    } catch (e) {
      console.error(`Dim ${d.dimension.id} failed on ${path}: ${e.message}`);
      caughtDimErrors++;
    }
  }
}

// Aggregator pass: cross-surface, etc · run once after individual file passes
for (const d of dimensions) {
  if (!d.dimension.isAggregator || typeof d.aggregate !== 'function') continue;
  try {
    const ctx = { spec, specPath, allProfiles: profiles, opts, allFiles: files };
    const vs = d.aggregate(ctx);
    for (const v of vs) allViolations.push(v);
  } catch (e) {
    console.error(`Dim ${d.dimension.id} aggregate failed: ${e.message}`);
    caughtDimErrors++;
  }
}

// ---------- report ----------
const reportCtx = {
  cwd: process.cwd(),
  specPath,
  targetPath: absTarget,
  profilesByFile,
  dimensionsRun: dimensions.map(d => d.dimension.id),
  filesScanned: files.length,
};

const p0 = allViolations.filter(v => v.severity === 'P0').length;
const p1 = allViolations.filter(v => v.severity === 'P1').length;
const isPass = p0 === 0 && p1 === 0;

function emitReport() {
  if (format === 'json') reportJSON(allViolations, reportCtx);
  else if (format === 'html') reportHTML(allViolations, reportCtx);
  else if (format === 'summary') reportSummary(allViolations, reportCtx);
  else reportTerminal(allViolations, reportCtx);
}

// --fix review-gate (dry-run by default · --apply writes). Only the high-certainty dimensions
// (01-hex Δ≤2 · 08-easing) attach a structured `fix`; structural/ambiguous findings stay
// report-only. The user-consent step lives at the Claude/user layer: show the dry-run diff →
// user approves → re-run with --apply.
if (opts.fix) {
  if (!(opts.quiet && isPass)) emitReport();  // context first, unless silent-pass
  const fixableCount = allViolations.filter(v => v.fix).length;
  const remaining = allViolations.length - fixableCount;
  const result = runFixes(allViolations, { apply: !!opts.apply });
  reportFix(result, { cwd: process.cwd(), dryRun: !opts.apply, remaining });
  process.exit(result.files.some(f => f.error) ? 2 : 0);
}

// Happy-path silence: clean pass + --quiet → emit nothing, exit 0. (If checks threw errors the
// pass isn't truly clean, so fall through and surface them.)
if (opts.quiet && isPass && caughtDimErrors === 0) process.exit(0);

emitReport();

// Exit code logic (refined 2026-05-26 per Layer 4 review §1 P2):
// 3 = P0 violations present (CI: must-fix gate)
// 1 = P1 violations only (CI: should-fix · soft gate)
// 0 = pass (no P0/P1 · P2-only OK) OR pass with caught dim errors (warned to stderr)
// Plus: if dim functions silently threw errors but produced no P0/P1, still warn at end
if (caughtDimErrors > 0) {
  console.error(`\n⚠  ${caughtDimErrors} dimension check(s) threw errors and were silently skipped · review stderr above. Audit results may be incomplete.`);
}
if (p0 > 0) process.exit(3);
if (p1 > 0) process.exit(1);
process.exit(0);
