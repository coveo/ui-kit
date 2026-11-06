import {REPO_NAME, REPO_OWNER} from '../common/constants.mjs';

const REPOSITORY_URL = `https://github.com/${REPO_OWNER}/${REPO_NAME}`;
const JIRA_URL = 'https://coveord.atlassian.net';
const GROUPS = {atomic: 'Atomic', quantic: 'Quantic', other: 'Samples and smoke tests'};
const LISTED_TESTS = 20;
const LISTED_JOBS = 5;
const FAILURE_WEIGHT = 3;
const TITLE_LENGTH = 100;
const PULL_REQUEST_CAUSES = {
  flaky: 'Flaky test: it passed on a retry at least once',
  mergeQueue: 'Something else: the merge queue failed it too',
  pullRequest: 'The pull request',
};

function suiteGroup(suite) {
  return suite === 'atomic' || suite === 'quantic' ? suite : 'other';
}

function testKey(suite, project, {file, title}) {
  return JSON.stringify([suite, project, file, title]);
}

function fileStem(file) {
  return file
    .split('/')
    .pop()
    .replace(/\.(e2e|spec|test)\.[cm]?[jt]s$/, '');
}

function getOrCreate(map, key, create) {
  if (!map.has(key)) {
    map.set(key, create());
  }
  return map.get(key);
}

function newEntry({project, run, record, test}) {
  return {
    suite: record.suite,
    project,
    file: test.file,
    line: test.line,
    title: test.title,
    flakyRuns: new Set(),
    failedMergeQueueRuns: new Set(),
    failedPullRequests: new Set(),
    lastSeen: run,
    // Records saved before they held the checked-out commit fall back to the run's head.
    sha: record.sha ?? run.headSha,
  };
}

// The link points at the commit the last run tested, so it takes that run's line too.
function markSeen(entry, {run, record, test}) {
  if (run.createdAt > entry.lastSeen.createdAt) {
    entry.lastSeen = run;
    entry.line = test.line;
    entry.sha = record.sha ?? run.headSha;
  }
}

// Quantic's setup job runs under "Run Quantic E2E tests" too, but it only creates scratch orgs.
function isTestJob(jobName) {
  return /^E2E: |^CDN Checks$|\btests\b/.test(jobName) && !/Setup e2e tests/.test(jobName);
}

// Names the step that failed in a merge-queue job in words a reader understands at a glance, and
// its kind: `test` in a test job, `infrastructure` in a setup step or when no step failed, and
// `unknown` anywhere else, such as a build or a lint check.
function stepCause(jobName, step) {
  if (/e2e-quantic-setup/.test(step)) {
    return {cause: 'Quantic scratch-org setup', kind: 'infrastructure'};
  }
  if (step.endsWith('actions/setup')) {
    return {cause: 'Dependency setup', kind: 'infrastructure'};
  }
  if (/playwright-quantic/.test(step)) {
    return {cause: 'Quantic e2e tests failed', kind: 'test'};
  }
  if (/STEPS_PLAYWRIGHT_OUTCOME/.test(step)) {
    return {cause: 'Atomic e2e tests failed', kind: 'test'};
  }
  if (!step) {
    return {cause: `${jobName}: no failed step reported`, kind: 'infrastructure'};
  }
  return {cause: `${jobName}: ${step}`, kind: isTestJob(jobName) ? 'test' : 'unknown'};
}

// A failed test explains a run even next to a failed setup, so it decides the run's kind first.
function runKind(jobCauses) {
  const kinds = new Set(jobCauses.map(({kind}) => kind));
  if (kinds.has('test')) {
    return 'test';
  }
  return kinds.has('unknown') ? 'unknown' : 'infrastructure';
}

/**
 * Folds the collected CI data into the figures the report shows:
 * - `runCounts`: all runs in the window, and the merge-queue runs among them.
 * - `suites`: for Atomic, Quantic and the other suites, the runs that executed them, and how many
 *   of those had a test that passed only on retry.
 * - `tests`: one row per flaky test and Playwright project: a test that passed on a retry, failed
 *   every retry in the merge queue, or failed every retry in a pull request while it passed on a
 *   retry in another project or suite. Each row has its flaky runs, the merge-queue runs and, for a
 *   test that passed on a retry, the pull requests where it failed every retry, the IDs of its flaky
 *   and merge-queue runs, and the last run that saw it. Rows rank by flaky runs plus three per
 *   merge-queue run or pull request where the test failed every retry.
 * - `pullRequestCauses`: the pull requests where a test failed every retry, by likely cause: `flaky`
 *   when that test passed on a retry in the window, `mergeQueue` when it failed every retry in the
 *   merge queue too, and `pullRequest` otherwise, each with its latest run. Causes with no pull
 *   request are left out.
 * - `mergeQueueCauses`: failed merge-queue runs grouped by cause: the test files that failed every
 *   retry when there are some, otherwise the step that failed in each job. Their kind is `test` when
 *   a test failed, `infrastructure` when only a setup failed or no step did, and `unknown` otherwise.
 * - `recoveries`: per job, the runs that only passed after a re-run.
 * - `skips`: the skipped tests, oldest first.
 */
export function buildModel({window, runs, records, recoveries, mergeQueueFailures, skips}) {
  const runsById = new Map(runs.map((run) => [run.id, run]));
  const groups = new Map(
    Object.keys(GROUPS).map((id) => [id, {runs: new Set(), flakyRuns: new Set()}])
  );
  const tests = new Map();
  const failedFilesByMergeQueueRun = new Map();
  const pullRequestFailures = [];

  for (const record of records) {
    const run = runsById.get(record.runId);
    const group = groups.get(suiteGroup(record.suite));
    group.runs.add(run.id);
    if (record.flaky > 0) {
      group.flakyRuns.add(run.id);
    }
    for (const test of record.tests ?? []) {
      // Records saved before they held the project fall back to an unnamed one.
      const project = test.project ?? '';
      const key = testKey(record.suite, project, test);
      // Its cause depends on what the other runs saw of that test, so it is decided once all are read.
      if (test.outcome === 'failed' && run.event !== 'merge_group') {
        pullRequestFailures.push({key, project, run, record, test});
        continue;
      }
      if (test.outcome === 'failed') {
        getOrCreate(failedFilesByMergeQueueRun, run.id, () => new Set()).add(fileStem(test.file));
      }
      const entry = getOrCreate(tests, key, () => newEntry({project, run, record, test}));
      (test.outcome === 'flaky' ? entry.flakyRuns : entry.failedMergeQueueRuns).add(run.id);
      markSeen(entry, {run, record, test});
    }
  }

  // A test that passed on a retry in one Playwright project or suite is flaky in all of them, so a
  // cause holds for its file and title. A pull request counts once, however often it was pushed.
  const fileAndTitle = ({file, title}) => JSON.stringify([file, title]);
  const entries = [...tests.values()];
  const flakyTests = new Set(entries.filter((entry) => entry.flakyRuns.size > 0).map(fileAndTitle));
  const failedInMergeQueue = new Set(
    entries.filter((entry) => entry.failedMergeQueueRuns.size > 0).map(fileAndTitle)
  );
  const pullRequestsByCause = new Map(
    Object.keys(PULL_REQUEST_CAUSES).map((cause) => [
      cause,
      {pullRequests: new Set(), latest: null},
    ])
  );
  for (const failure of pullRequestFailures) {
    const {run} = failure;
    const id = fileAndTitle(failure.test);
    const cause = flakyTests.has(id)
      ? 'flaky'
      : failedInMergeQueue.has(id)
        ? 'mergeQueue'
        : 'pullRequest';
    const seen = pullRequestsByCause.get(cause);
    seen.pullRequests.add(run.pullRequest);
    if (!seen.latest || run.createdAt > seen.latest.createdAt) {
      seen.latest = run;
    }
    if (cause === 'flaky') {
      const entry = getOrCreate(tests, failure.key, () => newEntry(failure));
      entry.failedPullRequests.add(run.pullRequest);
      markSeen(entry, failure);
    }
  }
  const pullRequestCauses = [...pullRequestsByCause]
    .filter(([, {pullRequests}]) => pullRequests.size > 0)
    .map(([cause, {pullRequests, latest}]) => ({
      cause,
      pullRequests: pullRequests.size,
      latest: {runId: latest.id, createdAt: latest.createdAt},
    }));

  const score = (row) =>
    row.flakyRuns + FAILURE_WEIGHT * (row.failedInPullRequests + row.failedInMergeQueue);
  const testRows = [...tests.values()]
    .map((entry) => ({
      suite: entry.suite,
      project: entry.project,
      file: entry.file,
      line: entry.line,
      title: entry.title,
      flakyRuns: entry.flakyRuns.size,
      failedInPullRequests: entry.failedPullRequests.size,
      failedInMergeQueue: entry.failedMergeQueueRuns.size,
      runIds: [...entry.flakyRuns.union(entry.failedMergeQueueRuns)].sort((a, b) => a - b),
      lastSeen: {runId: entry.lastSeen.id, createdAt: entry.lastSeen.createdAt},
      sha: entry.sha,
    }))
    .sort((a, b) => score(b) - score(a) || a.title.localeCompare(b.title));

  const causes = new Map();
  for (const failure of mergeQueueFailures) {
    const run = runsById.get(failure.runId);
    const files = failedFilesByMergeQueueRun.get(run.id);
    const jobCauses = failure.jobs.map((job) => stepCause(job.name, job.failedStep));
    const cause = files
      ? `Test failed every retry: ${[...files]
          .sort()
          .map((file) => `\`${file}\``)
          .join(', ')}`
      : [...new Set(jobCauses.map((job) => job.cause))].join(', ') || 'No failed job reported';
    getOrCreate(causes, cause, () => ({
      kind: files ? 'test' : runKind(jobCauses),
      runs: [],
    })).runs.push({runId: run.id, createdAt: run.createdAt});
  }
  const mergeQueueCauses = [...causes]
    .map(([cause, {kind, runs: causeRuns}]) => ({
      cause,
      kind,
      runs: causeRuns.toSorted((a, b) => a.createdAt.localeCompare(b.createdAt)),
    }))
    .sort((a, b) => b.runs.length - a.runs.length || a.cause.localeCompare(b.cause));

  const recoveriesByJob = new Map();
  for (const {runId, job} of recoveries) {
    getOrCreate(recoveriesByJob, job, () => []).push(runId);
  }
  const recoveryRows = [...recoveriesByJob]
    .map(([job, runIds]) => ({job, count: runIds.length, lastRunId: Math.max(...runIds)}))
    .sort((a, b) => b.count - a.count || a.job.localeCompare(b.job));

  return {
    window,
    runCounts: {
      total: runs.length,
      mergeQueue: runs.filter((run) => run.event === 'merge_group').length,
    },
    suites: Object.entries(GROUPS).map(([id, label]) => ({
      id,
      label,
      runs: groups.get(id).runs.size,
      flakyRuns: groups.get(id).flakyRuns.size,
    })),
    tests: testRows,
    pullRequestCauses,
    mergeQueueCauses,
    recoveries: recoveryRows,
    skips: [...skips].sort((a, b) => b.ageDays - a.ageDays || a.file.localeCompare(b.file)),
  };
}

/**
 * Reduces a one-week model to the snapshot that coveo-incubator/ui-kit-dashboard imports for that
 * week and never rewrites. The fields are schema 1 of the contract with that dashboard: renaming a
 * `GROUPS` key or a CI job splits a series there, and changing a field needs a new schema number.
 * `sha` and `generatedAt` name the commit and the time that built it, so a late or manual run
 * stands apart from the scheduled one.
 */
export function buildSnapshot(model, {sha, generatedAt} = {}) {
  return {
    schema: 1,
    source: 'report',
    sha,
    generatedAt,
    week: {start: model.window.start, end: model.window.end},
    runCounts: {total: model.runCounts.total, mergeQueue: model.runCounts.mergeQueue},
    suites: model.suites.map(({id, runs, flakyRuns}) => ({id, runs, flakyRuns})),
    // Schema 1 has no pull-request count, so a row known only from pull requests stays out.
    tests: model.tests
      .filter(({runIds}) => runIds.length > 0)
      .map(({suite, project, file, title, flakyRuns, failedInMergeQueue, runIds}) => ({
        suite,
        group: suiteGroup(suite),
        project,
        file,
        title,
        flakyRuns,
        failedInMergeQueue,
        runIds,
      })),
    mergeQueueCauses: model.mergeQueueCauses.map(({cause, kind, runs}) => ({
      cause,
      kind,
      runs: runs.length,
    })),
    recoveries: model.recoveries.map(({job, count}) => ({job, count})),
    skips: {
      total: model.skips.length,
      withoutTicket: model.skips.filter((skip) => !skip.ticket).length,
    },
  };
}

function escapeCell(text) {
  return String(text).replace(/[\\|]/g, '\\$&').replace(/\r?\n/g, ' ');
}

function shorten(text, limit) {
  return text.length <= limit ? text : `${text.slice(0, limit - 1).trimEnd()}…`;
}

function plural(count, noun) {
  return `${count.toLocaleString('en-US')} ${count === 1 ? noun : `${noun}s`}`;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

function tableRow(cells) {
  return `| ${cells.join(' | ')} |`;
}

function suiteLabel(suite) {
  const group = suiteGroup(suite);
  return group === 'other' ? suite : GROUPS[group];
}

function ticketLink(ticket) {
  const url = ticket.startsWith('#')
    ? `${REPOSITORY_URL}/issues/${ticket.slice(1)}`
    : `${JIRA_URL}/browse/${ticket}`;
  return `[${ticket}](${url})`;
}

function runLink({runId, createdAt}) {
  return `[${formatDate(createdAt)}](${REPOSITORY_URL}/actions/runs/${runId})`;
}

function sourceLink(ref, file, line, text) {
  return `[${text}](${REPOSITORY_URL}/blob/${ref}/${file}#L${line})`;
}

/**
 * Renders the model as the issue description, in Markdown, and the one-line weekly comment. Lists
 * stop at the top 20 tests and the top 5 jobs. Flaky tests link to their line in the commit their
 * last run tested; skipped tests link to `ref`, the commit the report was built from.
 */
export function renderReport(model, {ref}) {
  const period = `${formatDate(model.window.start)} to ${formatDate(model.window.end)}`;
  const failedRuns = model.mergeQueueCauses.reduce((total, row) => total + row.runs.length, 0);
  const mergeQueue = `${failedRuns} of ${plural(model.runCounts.mergeQueue, 'merge-queue run')} failed.`;
  const suites = model.suites
    .map((suite) => `${suite.label} ${suite.flakyRuns} of ${suite.runs}`)
    .join(', ');

  const lines = [
    `**${period}**, ${plural(model.runCounts.total, 'CI run')}. Runs with a flaky test, out of the runs that ran each suite: ${suites}.`,
    '',
    '## Flaky tests',
    '',
  ];
  if (model.tests.length === 0) {
    lines.push('No test needed a retry.');
  } else {
    lines.push(
      '| Test | Suite | Flaky runs | Failed every retry | Last seen |',
      '|---|---|---:|---:|---|',
      ...model.tests
        .slice(0, LISTED_TESTS)
        .map((row) =>
          tableRow([
            `${sourceLink(row.sha, row.file, row.line, `\`${fileStem(row.file)}\``)} ${escapeCell(shorten(row.title.split(' › ').pop(), TITLE_LENGTH))}`,
            [suiteLabel(row.suite), row.project].filter(Boolean).join(', '),
            row.flakyRuns,
            row.failedInPullRequests + row.failedInMergeQueue || '',
            runLink(row.lastSeen),
          ])
        )
    );
    if (model.tests.length > LISTED_TESTS) {
      lines.push('', `${plural(model.tests.length - LISTED_TESTS, 'more flaky test')} not shown.`);
    }
  }

  lines.push('', '## Pull-request failures', '');
  if (model.pullRequestCauses.length === 0) {
    lines.push('No test failed every retry in a pull request.');
  } else {
    lines.push(
      'Pull requests where a test failed every retry:',
      '',
      '| Likely cause | Pull requests | Latest |',
      '|---|---:|---|',
      ...model.pullRequestCauses.map((row) =>
        tableRow([PULL_REQUEST_CAUSES[row.cause], row.pullRequests, runLink(row.latest)])
      )
    );
  }

  lines.push('', '## Merge-queue failures', '', mergeQueue);
  if (model.mergeQueueCauses.length > 0) {
    lines.push(
      '',
      '| Cause | Runs |',
      '|---|---|',
      ...model.mergeQueueCauses.map((row) =>
        tableRow([escapeCell(row.cause), row.runs.map(runLink).join(', ')])
      )
    );
  }

  lines.push('', '## Jobs that passed only after a re-run', '');
  if (model.recoveries.length === 0) {
    lines.push('No job needed a re-run.');
  } else {
    lines.push(
      '| Job | Re-runs | Latest |',
      '|---|---:|---|',
      ...model.recoveries
        .slice(0, LISTED_JOBS)
        .map((row) =>
          tableRow([
            escapeCell(row.job),
            row.count,
            `[run](${REPOSITORY_URL}/actions/runs/${row.lastRunId})`,
          ])
        )
    );
    if (model.recoveries.length > LISTED_JOBS) {
      lines.push('', `${plural(model.recoveries.length - LISTED_JOBS, 'more job')} not shown.`);
    }
  }

  const withoutTicket = model.skips.filter((skip) => !skip.ticket).length;
  lines.push(
    '',
    '## Skipped tests',
    '',
    `${plural(model.skips.length, 'skipped test')}, ${withoutTicket} without a ticket nearby.`
  );
  if (model.skips.length > 0) {
    lines.push(
      '',
      '<details><summary>All skipped tests, oldest first</summary>',
      '',
      '| Skipped for | Test | Ticket |',
      '|---:|---|---|',
      ...model.skips.map((skip) =>
        tableRow([
          plural(skip.ageDays, 'day'),
          sourceLink(ref, skip.file, skip.line, `${skip.file.split('/').pop()}:${skip.line}`),
          skip.ticket ? ticketLink(skip.ticket) : 'none',
        ])
      ),
      '',
      '</details>'
    );
  }

  const [top] = model.tests;
  const comment = [
    `**${period}:**`,
    top
      ? `${plural(model.tests.length, 'flaky test')}, led by \`${fileStem(top.file)}\`.`
      : 'no flaky test.',
    mergeQueue,
  ].join(' ');

  return {body: `${lines.join('\n')}\n`, comment};
}
