// lib/define-profile.mjs — interactive Q&A to create a new surface-profile JSON

import { createInterface } from 'node:readline';
import { writeFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

function prompt(rl, q) {
  return new Promise(resolve => rl.question(q, answer => resolve(answer)));
}

function csvList(s) {
  return s.split(',').map(x => x.trim()).filter(Boolean);
}

export async function defineProfile(profileName, profilesDir) {
  console.log(`\n=== Define new surface profile: "${profileName}" ===\n`);
  console.log('Answer the questions below to generate surface-profiles/' + profileName + '.json');
  console.log('Press ENTER to accept defaults shown in [brackets].\n');

  const rl = createInterface({ input: process.stdin, output: process.stdout });

  const label = (await prompt(rl, `1. Human-readable label (e.g. "Email Template") [${profileName}]: `)) || profileName;

  const filePatternStr = await prompt(rl,
    `2. File patterns (comma-separated globs, e.g. "**/*.eml,**/templates/*.html"): `);
  const filePattern = csvList(filePatternStr);

  const sniffStr = await prompt(rl,
    `3. Content-sniff substrings (comma-separated, e.g. "<mj-button,mso-mso"): `);
  const contentSniff = csvList(sniffStr);

  const nsStr = await prompt(rl,
    `4. Allowed extension namespaces (comma-separated, e.g. "--email-,--mso-"): `);
  const allowedNamespaces = csvList(nsStr);

  const ruleText = await prompt(rl,
    `5. Free-text rule note (e.g. "no flex/grid · table layout only"): `);

  const wcagRequired = (await prompt(rl,
    `6. Require WCAG ratio comment on color extensions? (y/n) [n]: `)).toLowerCase() === 'y';

  const orthoAxes = await prompt(rl,
    `7. Tag-orthogonality axes (comma-separated, blank if none, e.g. "priority,channel"): `);
  const tagOrthogonality = orthoAxes.trim()
    ? {
        axes: csvList(orthoAxes),
        uniquePerAxis: true,
      }
    : null;

  const minBodyGap = parseInt(await prompt(rl, `8. Density floor · min body-text gap in px [12]: `)) || 12;
  const minSectionGap = parseInt(await prompt(rl, `9. Density floor · min section gap in px [24]: `)) || 24;

  const fileTypesStr = await prompt(rl, `10. File extensions (comma-separated, e.g. ".html,.eml") [auto-derive]: `);
  const fileTypes = fileTypesStr.trim() ? csvList(fileTypesStr) : null;

  rl.close();

  const profile = {
    name: profileName,
    label,
    detect: { filePattern, contentSniff },
    extensions: {
      allowedNamespaces,
      rule: ruleText,
      ...(wcagRequired ? { requireCommentPattern: 'WCAG \\d+\\.?\\d*:1' } : {}),
      ...(tagOrthogonality ? { tagOrthogonality } : {}),
    },
    thresholds: {
      densityFloor: { minBodyTextGap: minBodyGap, minSectionGap },
      rhythmStrict: [],
    },
    typeRoleMapping: {},
    ...(fileTypes ? { fileTypes } : {}),
  };

  // Write
  const outPath = resolve(profilesDir, `${profileName}.json`);
  if (existsSync(outPath)) {
    console.log(`\n⚠  Profile already exists at ${outPath}. Aborting (won't overwrite).`);
    process.exit(2);
  }
  writeFileSync(outPath, JSON.stringify(profile, null, 2) + '\n', 'utf8');
  console.log(`\n✓ Profile created at ${outPath}`);
  console.log(`\nReview + tune the JSON, then run:`);
  console.log(`   node audit.mjs <path> --surface=${profileName}`);
  console.log(`(or omit --surface to use auto-detection if your filePattern matches.)\n`);
}
