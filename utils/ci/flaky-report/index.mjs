#!/usr/bin/env node
// Builds the flaky test report from the past 14 days of CI runs.
// Usage: node utils/ci/flaky-report/index.mjs [--publish] [--snapshot <dir>] [--week-end <date>]
// By default it changes nothing on GitHub: it writes the report to the job summary, or to stdout
// outside GitHub Actions, with a GITHUB_TOKEN that can read actions. Only --publish updates the
// report issue, which also needs write access to issues.
// --snapshot also saves the last full week to <dir>/flaky-snapshot-<week start>.json. Weeks end on
// Sunday at 11:00 UTC, when the report is scheduled, so a late run saves the same week. --week-end
// YYYY-MM-DD saves the week that ended on or before that day instead.
import {appendFileSync, mkdirSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {parseArgs} from 'node:util';
import {Octokit} from 'octokit';
import {DAY_IN_MS, REPO_NAME, REPO_OWNER} from '../common/constants.mjs';
import {
  collectMergeQueueFailures,
  collectRecords,
  collectRecoveries,
  collectSkips,
  listRuns,
} from './collect.mjs';
import {findReportIssue, ISSUE_TITLE, publishReport} from './issue.mjs';
import {buildModel, buildSnapshot, renderReport} from './report.mjs';

// The records it reads expire after 15 days, the repository's artifact retention.
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
  };
}

const github = {
  octokit: new Octokit({auth: process.env.GITHUB_TOKEN}),
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
  `${runs.length} runs, ${records.length} records, ${recoveries.length} re-run recoveries, ${mergeQueueFailures.length} merge-queue failures, ${skips.length} skipped tests.`
);
const collected = {runs, records, recoveries, mergeQueueFailures, skips};

const report = renderReport(buildModel(within(window, collected)), {
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
  mkdirSync(options.snapshot, {recursive: true});
  writeFileSync(
    file,
    `${JSON.stringify(buildSnapshot(buildModel(within(week, collected))), null, 2)}\n`
  );
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `snapshot=${name}\n`);
  }
  console.log(`Wrote ${file}`);
}
