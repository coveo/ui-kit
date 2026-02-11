/**
 * manual-audit-delta.mjs
 *
 * QA workflow tool for maintaining manual accessibility audits.
 *
 * Commands:
 *   node a11y/scripts/manual-audit-delta.mjs validate <delta-file>
 *   node a11y/scripts/manual-audit-delta.mjs merge [--dry-run]
 *   node a11y/scripts/manual-audit-delta.mjs status
 *
 * Delta files live in a11y/reports/deltas/ and follow a strict schema.
 * The merge command folds all deltas into the baseline audit files,
 * then moves processed deltas to a11y/reports/deltas/archived/.
 */

import {mkdir, readdir, readFile, rename, writeFile} from 'node:fs/promises';
import path from 'node:path';

const REPORTS_DIR = 'a11y/reports';
const DELTAS_DIR = path.join(REPORTS_DIR, 'deltas');
const ARCHIVE_DIR = path.join(DELTAS_DIR, 'archived');
const BASELINE_PATTERN = /^manual-audit-(?!.*-violations)([\w-]+)\.json$/;
const DELTA_PATTERN = /^delta-(\d{4}-\d{2}-\d{2})-([\w-]+)\.json$/;

const VALID_SURFACES = new Set([
  'commerce',
  'search',
  'insight',
  'ipx',
  'common',
  'recommendations',
]);

const VALID_STATUSES = new Set(['pass', 'fail', 'partial', 'not-applicable']);

const VALID_WCAG_KEYS = new Set([
  '2.4.11-focus-not-obscured',
  '2.5.7-dragging-movements',
  '2.5.8-target-size',
  '3.2.6-consistent-help',
  '3.3.7-redundant-entry',
  '3.3.8-accessible-auth',
]);

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validateDeltaEntry(entry, index) {
  const errors = [];
  const prefix = `entries[${index}]`;

  if (typeof entry.name !== 'string' || entry.name.length === 0) {
    errors.push(`${prefix}.name: must be a non-empty string`);
  }

  if (!VALID_SURFACES.has(entry.surface)) {
    errors.push(
      `${prefix}.surface: must be one of: ${[...VALID_SURFACES].join(', ')} (got "${entry.surface}")`
    );
  }

  if (typeof entry.auditor !== 'string' || entry.auditor.length === 0) {
    errors.push(
      `${prefix}.auditor: must be a non-empty string (who performed this audit)`
    );
  }

  if (!isRecord(entry.results)) {
    errors.push(`${prefix}.results: must be an object`);
    return errors;
  }

  const {results} = entry;

  for (const field of ['keyboardNav', 'screenReader', 'focusManagement']) {
    if (results[field] !== undefined && !VALID_STATUSES.has(results[field])) {
      errors.push(
        `${prefix}.results.${field}: must be one of: ${[...VALID_STATUSES].join(', ')} (got "${results[field]}")`
      );
    }
  }

  if (isRecord(results.wcag22Criteria)) {
    for (const [key, value] of Object.entries(results.wcag22Criteria)) {
      if (!VALID_WCAG_KEYS.has(key)) {
        errors.push(
          `${prefix}.results.wcag22Criteria.${key}: unknown criterion key`
        );
      }
      if (!VALID_STATUSES.has(value)) {
        errors.push(
          `${prefix}.results.wcag22Criteria.${key}: must be one of: ${[...VALID_STATUSES].join(', ')} (got "${value}")`
        );
      }
    }
  }

  if (typeof results.notes !== 'string' || results.notes.length === 0) {
    errors.push(
      `${prefix}.results.notes: must be a non-empty string describing what was tested`
    );
  }

  return errors;
}

function validateDeltaFile(content, filePath) {
  const errors = [];

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch {
    return [`${filePath}: invalid JSON`];
  }

  if (!isRecord(parsed)) {
    return [`${filePath}: root must be an object`];
  }

  if (
    typeof parsed.date !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(parsed.date)
  ) {
    errors.push(
      `${filePath}: date must be in YYYY-MM-DD format (got "${parsed.date}")`
    );
  }

  if (typeof parsed.pr !== 'string' && typeof parsed.pr !== 'number') {
    errors.push(
      `${filePath}: pr must be a string or number (PR number or "quarterly-2026-Q1")`
    );
  }

  if (typeof parsed.auditor !== 'string' || parsed.auditor.length === 0) {
    errors.push(`${filePath}: auditor must be a non-empty string`);
  }

  if (!Array.isArray(parsed.entries) || parsed.entries.length === 0) {
    errors.push(`${filePath}: entries must be a non-empty array`);
    return errors;
  }

  for (let i = 0; i < parsed.entries.length; i++) {
    const entryErrors = validateDeltaEntry(parsed.entries[i], i);
    for (const error of entryErrors) {
      errors.push(`${filePath}: ${error}`);
    }
  }

  return errors;
}

async function readJsonFile(filePath) {
  const content = await readFile(filePath, 'utf8');
  return JSON.parse(content);
}

async function loadBaselines() {
  const files = await readdir(REPORTS_DIR);
  const baselines = new Map();

  for (const file of files) {
    const match = file.match(BASELINE_PATTERN);
    if (!match) continue;

    const surface = match[1];
    const filePath = path.join(REPORTS_DIR, file);
    const entries = await readJsonFile(filePath);
    if (!Array.isArray(entries)) continue;

    baselines.set(surface, {filePath, entries});
  }

  return baselines;
}

async function loadDeltas() {
  let files;
  try {
    files = await readdir(DELTAS_DIR);
  } catch {
    return [];
  }

  const deltas = [];
  for (const file of files) {
    if (!DELTA_PATTERN.test(file)) continue;

    const filePath = path.join(DELTAS_DIR, file);
    const content = await readFile(filePath, 'utf8');
    const errors = validateDeltaFile(content, filePath);

    if (errors.length > 0) {
      console.error(`Skipping invalid delta ${file}:`);
      for (const error of errors) {
        console.error(`  ${error}`);
      }
      continue;
    }

    const parsed = JSON.parse(content);
    deltas.push({file, filePath, data: parsed});
  }

  return deltas.sort((a, b) => a.data.date.localeCompare(b.data.date));
}

function applyDelta(baseline, deltaEntry) {
  const existing = baseline.find((entry) => entry.name === deltaEntry.name);
  const {results} = deltaEntry;

  if (existing) {
    if (results.keyboardNav !== undefined) {
      existing.manual.keyboardNav = results.keyboardNav;
    }
    if (results.screenReader !== undefined) {
      existing.manual.screenReader = results.screenReader;
    }
    if (results.focusManagement !== undefined) {
      existing.manual.focusManagement = results.focusManagement;
    }
    if (isRecord(results.wcag22Criteria)) {
      for (const [key, value] of Object.entries(results.wcag22Criteria)) {
        existing.manual.wcag22Criteria[key] = value;
      }
    }
    existing.manual.notes = results.notes;
    existing.manual.status = 'complete';
    existing.manual.lastAuditDate = deltaEntry.auditDate ?? results.auditDate;
    existing.manual.auditor = deltaEntry.auditor;
    return 'updated';
  }

  baseline.push({
    name: deltaEntry.name,
    category: deltaEntry.surface,
    manual: {
      status: 'complete',
      tier: 2,
      keyboardNav: results.keyboardNav ?? 'not-applicable',
      screenReader: results.screenReader ?? 'pass',
      focusManagement: results.focusManagement ?? 'not-applicable',
      wcag22Criteria: {
        '2.4.11-focus-not-obscured': 'not-applicable',
        '2.5.7-dragging-movements': 'not-applicable',
        '2.5.8-target-size': 'not-applicable',
        '3.2.6-consistent-help': 'not-applicable',
        '3.3.7-redundant-entry': 'not-applicable',
        '3.3.8-accessible-auth': 'not-applicable',
        ...(results.wcag22Criteria ?? {}),
      },
      notes: results.notes,
      lastAuditDate: deltaEntry.auditDate ?? results.auditDate,
      auditor: deltaEntry.auditor,
    },
  });
  return 'added';
}

async function runValidate(filePath) {
  if (!filePath) {
    console.error(
      'Usage: node a11y/scripts/manual-audit-delta.mjs validate <delta-file>'
    );
    process.exit(1);
  }

  const content = await readFile(filePath, 'utf8');
  const errors = validateDeltaFile(content, filePath);

  if (errors.length === 0) {
    console.log(`✅ ${filePath} is valid`);
    const parsed = JSON.parse(content);
    console.log(
      `   ${parsed.entries.length} component(s), auditor: ${parsed.auditor}, date: ${parsed.date}`
    );
  } else {
    console.error(`❌ ${filePath} has ${errors.length} error(s):\n`);
    for (const error of errors) {
      console.error(`  ${error}`);
    }
    process.exit(1);
  }
}

async function runMerge(dryRun) {
  const baselines = await loadBaselines();
  const deltas = await loadDeltas();

  if (deltas.length === 0) {
    console.log(
      'No delta files found in a11y/reports/deltas/. Nothing to merge.'
    );
    return;
  }

  console.log(`Found ${deltas.length} delta file(s) to merge.\n`);

  const changes = [];

  for (const delta of deltas) {
    console.log(
      `Processing: ${delta.file} (${delta.data.date}, PR: ${delta.data.pr})`
    );

    for (const entry of delta.data.entries) {
      const surface = entry.surface;
      let baseline = baselines.get(surface);

      if (!baseline) {
        const newFilePath = path.join(
          REPORTS_DIR,
          `manual-audit-${surface}.json`
        );
        baseline = {filePath: newFilePath, entries: []};
        baselines.set(surface, baseline);
        console.log(`  Creating new baseline: manual-audit-${surface}.json`);
      }

      const entryWithMeta = {
        ...entry,
        auditDate: delta.data.date,
        auditor: entry.auditor || delta.data.auditor,
      };
      const action = applyDelta(baseline.entries, entryWithMeta);
      changes.push({
        component: entry.name,
        surface,
        action,
        delta: delta.file,
      });
      console.log(
        `  ${action === 'added' ? '➕' : '✏️'}  ${entry.name} (${surface})`
      );
    }
  }

  console.log(
    `\n${changes.length} component(s) affected across ${baselines.size} surface(s).`
  );

  if (dryRun) {
    console.log(
      '\n[DRY RUN] No files written. Remove --dry-run to apply changes.'
    );
    return;
  }

  for (const [, baseline] of baselines) {
    baseline.entries.sort((a, b) => a.name.localeCompare(b.name, 'en-US'));
    await writeFile(
      baseline.filePath,
      `${JSON.stringify(baseline.entries, null, 2)}\n`,
      'utf8'
    );
    console.log(`  Wrote: ${baseline.filePath}`);
  }

  await mkdir(ARCHIVE_DIR, {recursive: true});
  for (const delta of deltas) {
    const archivePath = path.join(ARCHIVE_DIR, delta.file);
    await rename(delta.filePath, archivePath);
    console.log(`  Archived: ${delta.file} → deltas/archived/`);
  }

  console.log('\n✅ Merge complete.');
}

async function runStatus() {
  const baselines = await loadBaselines();
  const deltas = await loadDeltas();

  console.log('=== Baseline Audit Files ===\n');
  if (baselines.size === 0) {
    console.log('  No baseline files found.');
  }
  for (const [surface, baseline] of baselines) {
    const total = baseline.entries.length;
    const withAuditor = baseline.entries.filter(
      (e) => e.manual?.auditor
    ).length;
    const fails = baseline.entries.filter((e) => {
      const m = e.manual;
      if (!m) return false;
      if (
        m.keyboardNav === 'fail' ||
        m.screenReader === 'fail' ||
        m.focusManagement === 'fail'
      )
        return true;
      const wcag = m.wcag22Criteria;
      if (!wcag) return false;
      return Object.values(wcag).some((v) => v === 'fail');
    }).length;
    console.log(
      `  ${surface}: ${total} components, ${fails} failing, ${withAuditor} with auditor attribution`
    );
  }

  console.log('\n=== Pending Deltas ===\n');
  if (deltas.length === 0) {
    console.log('  No pending deltas.');
  }
  for (const delta of deltas) {
    console.log(
      `  ${delta.file}: ${delta.data.entries.length} component(s), auditor: ${delta.data.auditor}, date: ${delta.data.date}`
    );
  }

  let archivedCount = 0;
  try {
    const archived = await readdir(ARCHIVE_DIR);
    archivedCount = archived.filter((f) => DELTA_PATTERN.test(f)).length;
  } catch {
    // no archive dir yet
  }
  console.log(`\n=== Archived Deltas: ${archivedCount} ===`);
}

const [command, ...args] = process.argv.slice(2);

switch (command) {
  case 'validate':
    runValidate(args[0]).catch((error) => {
      console.error(error);
      process.exit(1);
    });
    break;
  case 'merge':
    runMerge(args.includes('--dry-run')).catch((error) => {
      console.error(error);
      process.exit(1);
    });
    break;
  case 'status':
    runStatus().catch((error) => {
      console.error(error);
      process.exit(1);
    });
    break;
  default:
    console.log(`Usage:
  node a11y/scripts/manual-audit-delta.mjs validate <delta-file>
  node a11y/scripts/manual-audit-delta.mjs merge [--dry-run]
  node a11y/scripts/manual-audit-delta.mjs status

Delta file format (a11y/reports/deltas/delta-YYYY-MM-DD-<context>.json):
{
  "date": "2026-02-15",
  "pr": "1234",
  "auditor": "Jane Doe",
  "entries": [
    {
      "name": "atomic-commerce-facet",
      "surface": "commerce",
      "auditor": "Jane Doe",
      "results": {
        "keyboardNav": "pass",
        "screenReader": "pass",
        "focusManagement": "pass",
        "wcag22Criteria": {
          "2.5.8-target-size": "pass"
        },
        "notes": "Verified after PR #1234 fixed button min-size to 24x24."
      }
    }
  ]
}`);
    break;
}
