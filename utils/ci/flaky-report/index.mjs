#!/usr/bin/env node
// Builds the flaky test report from the past 30 days of CI runs.
// Usage: node utils/ci/flaky-report/index.mjs [--publish] [--days=30]
// By default it changes nothing on GitHub: it writes the report to the job summary, or to stdout
// outside GitHub Actions, with a GITHUB_TOKEN that can read actions. Only --publish updates the
// report issue, which also needs write access to issues.
import {execFileSync} from 'node:child_process';
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
import {findReportIssue, publishReport} from './issue.mjs';
import {buildModel, ISSUE_TITLE, renderReport} from './report.mjs';

const JIRA_URL = 'https://coveord.atlassian.net';
const REPOSITORY_URL = `https://github.com/${REPO_OWNER}/${REPO_NAME}`;

const publish = process.argv.includes('--publish');
const days = Number(process.argv.find((arg) => arg.startsWith('--days='))?.slice(7) ?? 30);

if (!process.env.GITHUB_TOKEN) {
  throw new Error('GITHUB_TOKEN is required.');
}
if (!Number.isInteger(days) || days < 1) {
  throw new Error(`--days must be a positive integer, got "${days}".`);
}

const github = {
  octokit: new Octokit({auth: process.env.GITHUB_TOKEN}),
  owner: REPO_OWNER,
  repo: REPO_NAME,
};
const end = new Date();
const window = {
  start: new Date(end.getTime() - days * DAY_IN_MS).toISOString(),
  end: end.toISOString(),
};
const repositoryRoot = execFileSync('git', ['rev-parse', '--show-toplevel'], {
  encoding: 'utf8',
}).trim();

const runs = await listRuns(github, window);
const collected = await Promise.all([
  collectRecords(github, runs),
  collectRecoveries(github, runs),
  collectMergeQueueFailures(github, runs),
]);
const [{records, downloads}, {recoveries}, {failures: mergeQueueFailures}] = collected;
const skips = collectSkips({repositoryRoot, now: end});
console.log(
  `${runs.length} runs, ${records.length} records (${downloads} downloaded), ${recoveries.length} re-run recoveries, ${mergeQueueFailures.length} merge-queue failures, ${skips.length} skipped tests.`
);

const report = renderReport(
  buildModel({window, runs, records, recoveries, mergeQueueFailures, skips}),
  {
    repositoryUrl: REPOSITORY_URL,
    ref: process.env.GITHUB_SHA ?? 'main',
    jiraUrl: JIRA_URL,
    partial: collected.some((result) => result.partial),
  }
);
const {data: rateLimit} = await github.octokit.rest.rateLimit.get();
console.log(
  `API rate limit left: ${rateLimit.resources.core.remaining} of ${rateLimit.resources.core.limit}.`
);

if (publish) {
  const issue = await findReportIssue(github, ISSUE_TITLE);
  console.log(`Updated ${await publishReport(github, {issue, report})}`);
} else {
  const output = `# ${report.title}, dry run\n\n${report.body}\n---\n\n**Weekly comment:** ${report.comment}\n`;
  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, output);
  } else {
    process.stdout.write(output);
  }
}
