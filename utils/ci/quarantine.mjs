// quarantine.json, at the repository root, lists the proven flaky Playwright tests that can't fail a
// CI run. A quarantined test keeps running, and the weekly flaky test report follows it until it is
// healthy, broken or expired. Entries come and go by pull request, one per test:
//   {"file": "<path from the repository root>", "title": "<describe › test>", "project": "<optional>",
//    "bug": "KIT-1234", "added": "2026-11-16", "expires": "2026-12-16"}
// An entry without a project covers every Playwright project. From its expiry date, the test blocks
// again. On the pull request that adds an entry, the report's dry run also checks that CI runs
// prove the test flaky (see flaky-report/entry.mjs).
import {existsSync, readFileSync} from 'node:fs';
import {join} from 'node:path';
import {DAY_IN_MS} from './common/constants.mjs';

export const QUARANTINE_FILE = 'quarantine.json';

const MAX_ENTRIES = 10;
// 30 days, plus one renewal of 30 days.
const MAX_DAYS = 60;
const BUG = /^KIT-\d+$/;

function isDate(value) {
  return (
    typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(value)) &&
    new Date(value).toISOString().startsWith(value)
  );
}

function isText(value) {
  return typeof value === 'string' && value.trim() !== '';
}

function entryProblems(entry, index) {
  const at = `entry ${index + 1}`;
  if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
    return [`${at} must be an object`];
  }
  const problems = [];
  for (const field of ['file', 'title']) {
    if (!isText(entry[field])) {
      problems.push(`${at} needs a "${field}"`);
    }
  }
  if (entry.project !== undefined && !isText(entry.project)) {
    problems.push(`${at} has an empty "project"`);
  }
  if (!BUG.test(entry.bug ?? '')) {
    problems.push(`${at} needs a "bug" like KIT-1234`);
  }
  for (const field of ['added', 'expires']) {
    if (!isDate(entry[field])) {
      problems.push(`${at} needs an "${field}" date like 2026-11-16`);
    }
  }
  if (isDate(entry.added) && isDate(entry.expires)) {
    const days = (Date.parse(entry.expires) - Date.parse(entry.added)) / DAY_IN_MS;
    if (days <= 0 || days > MAX_DAYS) {
      problems.push(`${at} must expire 1 to ${MAX_DAYS} days after it was added`);
    }
  }
  return problems;
}

/**
 * Reads and checks the quarantine list. A missing file means an empty list; an invalid one throws
 * with every problem found.
 */
export function readQuarantine(repositoryRoot) {
  const path = join(repositoryRoot, QUARANTINE_FILE);
  if (!existsSync(path)) {
    return [];
  }
  let entries;
  try {
    entries = JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    throw new Error(`${QUARANTINE_FILE} is not valid JSON: ${error.message}`);
  }
  const problems = Array.isArray(entries)
    ? entries.flatMap(entryProblems)
    : ['the list must be a JSON array'];
  if (Array.isArray(entries) && entries.length > MAX_ENTRIES) {
    problems.push(`at most ${MAX_ENTRIES} tests can be quarantined, not ${entries.length}`);
  }
  const keys = new Set();
  for (const entry of Array.isArray(entries) ? entries : []) {
    const key = JSON.stringify([entry?.file, entry?.title, entry?.project]);
    if (keys.has(key)) {
      problems.push(`"${entry.title}" is listed twice`);
    }
    keys.add(key);
  }
  if (problems.length > 0) {
    throw new Error(`${QUARANTINE_FILE} is invalid:\n- ${problems.join('\n- ')}`);
  }
  return entries;
}

export function isActive(entry, today) {
  return today < entry.expires;
}

export function matchesEntry(entry, {file, title, project}) {
  return (
    entry.file === file && entry.title === title && (!entry.project || entry.project === project)
  );
}
