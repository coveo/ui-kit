#!/usr/bin/env node
// Builds the flaky test report from the past 14 days of CI runs.
// Usage: node utils/ci/flaky-report/index.mjs [--publish] [--snapshot <dir>] [--week-end <date>]
// By default it changes nothing on GitHub: it writes the report to the job summary, or to stdout
// outside GitHub Actions, with a GITHUB_TOKEN that can read actions. Only --publish updates the
// report issue, which also needs write access to issues.
// --snapshot also saves the last full week to <dir>/flaky-snapshot-<week start>.json. Weeks end on
// Sunday at 11:00 UTC, when the report is scheduled, so a late run saves the same week. --week-end
// YYYY-MM-DD saves the week that ended on or before that day instead, if that week started in the
// last 15 days, while its records still exist.
// In a pull request, it also fails when quarantine.json gains a test that the past 14 days of CI
// runs don't prove flaky.
import {execFileSync} from 'node:child_process';
import {appendFileSync, mkdirSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {parseArgs} from 'node:util';
import {Octokit} from 'octokit';
import {DAY_IN_MS, REPO_NAME, REPO_OWNER} from '../common/constants.mjs';
import {QUARANTINE_FILE, readQuarantine} from '../quarantine.mjs';
import {
  collectBaseQuarantine,
  collectMergeQueueFailures,
  collectRecords,
  collectRecoveries,
  collectSkips,
  listRuns,
} from './collect.mjs';
import {addedEntries, PROVEN_FLAKY, unprovenEntries} from './entry.mjs';
import {findReportIssue, ISSUE_TITLE, publishReport} from './issue.mjs';
import {buildModel, buildSnapshot, renderReport} from './report.mjs';

// The records it reads expire after 15 days, the repository's artifact retention.
const RECORD_DAYS = 15;
const WINDOW_DAYS = 14;
const WEEK_IN_MS = 7 * DAY_IN_MS;
const WEEK_END_HOUR = 11;

const {values: options} = parseArgs({
  options: {
    publish: {type: 'boolean'},
    snapshot: {type: 'string'},
    'week-end': {type: 'string'},
  },
});

if (!process.env.GITHUB_TOKEN) {
  throw new Error('GITHUB_TOKEN is required.');
}

function lastWeekEnd(time) {
  const date = new Date(time);
  const sunday = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate() - date.getUTCDay(),
    WEEK_END_HOUR
  );
  return sunday <= time ? sunday : sunday - WEEK_IN_MS;
}

function isoSeconds(time) {
  return `${new Date(time).toISOString().slice(0, 19)}Z`;
}

function within({start, end}, collected) {
  const runs = collected.runs.filter((run) => run.createdAt >= start && run.createdAt < end);
  const runIds = new Set(runs.map((run) => run.id));
  const inRuns = ({runId}) => runIds.has(runId);
  return {
    window: {start, end},
    runs,
    records: collected.records.filter(inRuns),
    recoveries: collected.recoveries.filter(inRuns),
    mergeQueueFailures: collected.mergeQueueFailures.filter(inRuns),
    skips: collected.skips,
    quarantine: collected.quarantine,
  };
}

// Read first, so a pull request that breaks the list fails before the long collection.
const quarantine = readQuarantine(
  execFileSync('git', ['rev-parse', '--show-toplevel'], {encoding: 'utf8'}).trim()
);
// GitHub names the base branch in a pull request only.
const baseBranch = process.env.GITHUB_BASE_REF;
const added = baseBranch ? addedEntries(quarantine, collectBaseQuarantine(baseBranch)) : [];
if (baseBranch) {
  console.log(`Quarantine entries added since ${baseBranch}: ${added.length}.`);
}

const github = {
  // GitHub answers 502 in bursts of a minute or two; the default three retries wait 14 seconds in all.
  octokit: new Octokit({auth: process.env.GITHUB_TOKEN, retry: {retries: 6}}),
  owner: REPO_OWNER,
  repo: REPO_NAME,
};
const end = new Date();
const window = {
  start: new Date(end.getTime() - WINDOW_DAYS * DAY_IN_MS).toISOString(),
  end: end.toISOString(),
};
const weekEnd = lastWeekEnd(
  options['week-end'] ? Date.parse(`${options['week-end']}T23:59:59Z`) : end.getTime()
);
if (Number.isNaN(weekEnd) || weekEnd > end.getTime()) {
  throw new Error('--week-end must be a date like 2026-11-01, in a week that has ended.');
}
const week = {start: isoSeconds(weekEnd - WEEK_IN_MS), end: isoSeconds(weekEnd)};
// Without its expired records, an older week would look like it had no flaky test.
if (Date.parse(week.start) < end.getTime() - RECORD_DAYS * DAY_IN_MS) {
  throw new Error(
    `--week-end must pick a week that started in the last ${RECORD_DAYS} days: older records have expired.`
  );
}

const runs = await listRuns(github, {
  start: week.start < window.start ? week.start : window.start,
  end: window.end,
});
const [records, recoveries, mergeQueueFailures] = await Promise.all([
  collectRecords(github, runs),
  collectRecoveries(github, runs),
  collectMergeQueueFailures(github, runs),
]);
const skips = collectSkips();
console.log(
  `${runs.length} runs, ${records.length} records, ${recoveries.length} re-run recoveries, ${mergeQueueFailures.length} merge-queue failures, ${skips.length} skipped tests, ${quarantine.length} quarantined tests.`
);
const collected = {runs, records, recoveries, mergeQueueFailures, skips, quarantine};
const lastDays = within(window, collected);

const report = renderReport(buildModel(lastDays), {
  ref: process.env.GITHUB_SHA ?? 'main',
});

if (options.publish) {
  const issue = await findReportIssue(github);
  console.log(`Updated ${await publishReport(github, {issue, report})}`);
} else {
  const output = `# ${ISSUE_TITLE}, dry run\n\n${report.body}\n---\n\n**Weekly comment:** ${report.comment}\n`;
  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, output);
  } else {
    process.stdout.write(output);
  }
}

if (options.snapshot) {
  const name = `flaky-snapshot-${week.start.slice(0, 10)}`;
  const file = join(options.snapshot, `${name}.json`);
  const snapshot = buildSnapshot(buildModel(within(week, collected)), {
    sha: execFileSync('git', ['rev-parse', 'HEAD'], {encoding: 'utf8'}).trim(),
    generatedAt: window.end,
  });
  mkdirSync(options.snapshot, {recursive: true});
  writeFileSync(file, `${JSON.stringify(snapshot, null, 2)}\n`);
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `snapshot=${name}\n`);
  }
  console.log(`Wrote ${file}`);
}

const unproven = unprovenEntries(added, lastDays);
if (unproven.length > 0) {
  throw new Error(
    `${QUARANTINE_FILE} adds a test that the past ${WINDOW_DAYS} days of CI runs don't prove flaky. ${PROVEN_FLAKY}\n- ${unproven.join('\n- ')}`
  );
}
