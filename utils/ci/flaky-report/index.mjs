#!/usr/bin/env node
// Builds the flaky test report from the past 30 days of CI runs.
// Usage: node utils/ci/flaky-report/index.mjs [--publish]
// By default it changes nothing on GitHub: it writes the report to the job summary, or to stdout
// outside GitHub Actions, with a GITHUB_TOKEN that can read actions. Only --publish updates the
// report issue, which also needs write access to issues.
import {appendFileSync} from 'node:fs';
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
import {buildModel, renderReport} from './report.mjs';

const WINDOW_DAYS = 30;

const publish = process.argv.includes('--publish');

if (!process.env.GITHUB_TOKEN) {
  throw new Error('GITHUB_TOKEN is required.');
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

const runs = await listRuns(github, window);
const [records, recoveries, mergeQueueFailures] = await Promise.all([
  collectRecords(github, runs),
  collectRecoveries(github, runs),
  collectMergeQueueFailures(github, runs),
]);
const skips = collectSkips();
console.log(
  `${runs.length} runs, ${records.length} records, ${recoveries.length} re-run recoveries, ${mergeQueueFailures.length} merge-queue failures, ${skips.length} skipped tests.`
);

const report = renderReport(
  buildModel({window, runs, records, recoveries, mergeQueueFailures, skips}),
  {ref: process.env.GITHUB_SHA ?? 'main'}
);

if (publish) {
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
