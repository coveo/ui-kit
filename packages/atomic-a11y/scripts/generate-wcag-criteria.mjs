#!/usr/bin/env node

/**
 * Fetches the official W3C WCAG 2.2 JSON and generates `src/data/wcag-criteria.ts`.
 *
 * Source: https://www.w3.org/WAI/WCAG22/wcag.json
 *
 * Run manually:   node scripts/generate-wcag-criteria.mjs
 * Run via npm:    pnpm generate:wcag
 */

import {writeFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const WCAG_JSON_URL = 'https://www.w3.org/WAI/WCAG22/wcag.json';
const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = resolve(__dirname, '../src/data/wcag-criteria.ts');

/**
 * @param {string} level
 * @returns {'success_criteria_level_a' | 'success_criteria_level_aa'}
 */
function levelToChapterId(level) {
  switch (level) {
    case 'A':
      return 'success_criteria_level_a';
    case 'AA':
      return 'success_criteria_level_aa';
    default:
      throw new Error(`Unexpected level for A/AA filtering: ${level}`);
  }
}

/**
 * Determines the earliest WCAG version a criterion was introduced in.
 * @param {string[]} versions e.g. ["2.0", "2.1", "2.2"]
 * @returns {'2.0' | '2.1' | '2.2'}
 */
function earliestVersion(versions) {
  const ordered = ['2.0', '2.1', '2.2'];
  for (const v of ordered) {
    if (versions.includes(v)) {
      return v;
    }
  }
  throw new Error(`No recognized version found in: ${versions.join(', ')}`);
}

async function main() {
  console.log(`Fetching WCAG criteria from ${WCAG_JSON_URL}...`);
  const response = await fetch(WCAG_JSON_URL);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch WCAG JSON: ${response.status} ${response.statusText}`
    );
  }

  const wcag = await response.json();

  /** @type {Array<{id: string, handle: string, level: string, wcagVersion: string, chapterId: string}>} */
  const criteria = [];

  for (const principle of wcag.principles) {
    for (const guideline of principle.guidelines) {
      for (const sc of guideline.successcriteria) {
        // Only include A and AA (matching current scope)
        if (sc.level !== 'A' && sc.level !== 'AA') {
          continue;
        }

        criteria.push({
          id: sc.num,
          handle: sc.handle,
          level: sc.level,
          wcagVersion: earliestVersion(sc.versions),
          chapterId: levelToChapterId(sc.level),
        });
      }
    }
  }

  // Sort: level A first, then AA; within each level sort by criterion id
  criteria.sort((a, b) => {
    if (a.level !== b.level) {
      return a.level === 'A' ? -1 : 1;
    }
    return a.id.localeCompare(b.id, undefined, {numeric: true});
  });

  const lines = [
    `/**`,
    ` * Auto-generated from ${WCAG_JSON_URL}`,
    ` * Run \`pnpm generate:wcag\` to regenerate.`,
    ` *`,
    ` * DO NOT EDIT MANUALLY.`,
    ` */`,
    ``,
    `import type {CriterionLevel, WCAGVersion} from '../shared/types.js';`,
    ``,
    `type ChapterId = 'success_criteria_level_a' | 'success_criteria_level_aa';`,
    ``,
    `interface WcagCriterionDefinition {`,
    `  id: string;`,
    `  handle: string;`,
    `  level: CriterionLevel;`,
    `  wcagVersion: WCAGVersion;`,
    `  chapterId: ChapterId;`,
    `}`,
    ``,
    `export const wcagCriteriaDefinitions: WcagCriterionDefinition[] = [`,
  ];

  for (const c of criteria) {
    lines.push(`  {`);
    lines.push(`    id: '${c.id}',`);
    lines.push(`    handle: '${c.handle.replace(/'/g, "\\'")}',`);
    lines.push(`    level: '${c.level}',`);
    lines.push(`    wcagVersion: '${c.wcagVersion}',`);
    lines.push(`    chapterId: '${c.chapterId}',`);
    lines.push(`  },`);
  }

  lines.push(`];`);
  lines.push(``);

  const content = lines.join('\n');
  writeFileSync(OUTPUT_PATH, content, 'utf-8');
  console.log(
    `Generated ${OUTPUT_PATH} with ${criteria.length} criteria (A + AA).`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
