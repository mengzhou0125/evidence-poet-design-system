// lib/profile.mjs — surface profile loader + detector

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// Tiny glob matcher: supports ** and *
// Key fix: /**/ matches "any number of path segments including zero" so
// `**/review_html/**/*.html` matches `prototypes/review_html/sample.html`.
// Uses sentinel-based replacement to avoid clobbering between glob tokens.
function matchPattern(pattern, filePath) {
  const fp = filePath.replace(/\\/g, '/').toLowerCase();
  const p = pattern.toLowerCase();
  let re = p.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  // Order: tokenize ** patterns first with sentinels · then single * · then restore.
  re = re.replace(/\/\*\*\//g, '__SLASHGLOBSTAR__');  // /**/ — zero or more segments
  re = re.replace(/\*\*/g, '__GLOBSTAR__');           // ** — anything
  re = re.replace(/\*/g, '[^/]*');                     // * — no-slash
  re = re.replace(/__GLOBSTAR__/g, '.*');
  re = re.replace(/__SLASHGLOBSTAR__/g, '(?:/.*/|/)');
  re = '^' + re + '$';
  return new RegExp(re).test(fp);
}

export function loadProfiles(profilesDir) {
  let entries;
  try { entries = readdirSync(profilesDir); }
  catch (e) { return []; }
  const profiles = [];
  for (const name of entries) {
    if (!name.endsWith('.json')) continue;
    const path = join(profilesDir, name);
    try {
      const json = JSON.parse(readFileSync(path, 'utf8'));
      json._sourcePath = path;
      profiles.push(json);
    } catch (e) {
      console.error(`Warn: profile ${name} parse failed: ${e.message}`);
    }
  }
  return profiles;
}

// Detect: returns { profile, confidence, hits } or null
export function detectProfile(filePath, fileText, profiles) {
  let best = null;
  for (const p of profiles) {
    const detect = p.detect || {};
    // 1. filePattern check (any-match)
    const patterns = detect.filePattern || [];
    let patternMatch = patterns.length === 0;
    for (const pat of patterns) {
      if (matchPattern(pat, filePath)) { patternMatch = true; break; }
    }
    if (!patternMatch) continue;

    // 2. contentSniff scoring (count hits)
    const sniffs = detect.contentSniff || [];
    let hits = 0;
    for (const s of sniffs) {
      if (fileText.includes(s)) hits++;
    }

    // Score: filePattern match = base score, each sniff hit boosts
    const score = (patternMatch ? 1 : 0) + hits;
    if (best === null || score > best.score) {
      best = { profile: p, score, hits };
    }
  }
  if (!best) return null;
  // Require at least one signal (pattern or content) and >0 sniff hits if patterns are weak
  const confidence = best.hits / Math.max(1, (best.profile.detect?.contentSniff || []).length);
  return { profile: best.profile, confidence, hits: best.hits };
}

// Auto-classify: even if no profile matches filePattern, score by content sniffs only
export function autoClassify(filePath, fileText, profiles) {
  let best = null;
  for (const p of profiles) {
    const sniffs = (p.detect || {}).contentSniff || [];
    if (sniffs.length === 0) continue;
    let hits = 0;
    for (const s of sniffs) {
      if (fileText.includes(s)) hits++;
    }
    if (hits === 0) continue;
    const confidence = hits / sniffs.length;
    if (best === null || confidence > best.confidence) {
      best = { profile: p, confidence, hits };
    }
  }
  return best;
}
