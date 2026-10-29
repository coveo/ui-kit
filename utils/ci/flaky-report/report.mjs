import {REPO_NAME, REPO_OWNER} from '../common/constants.mjs';

const REPOSITORY_URL = `https://github.com/${REPO_OWNER}/${REPO_NAME}`;
const JIRA_URL = 'https://coveord.atlassian.net';
const GROUPS = {atomic: 'Atomic', quantic: 'Quantic', other: 'Samples and smoke tests'};
const LISTED_TESTS = 20;
const LISTED_JOBS = 5;
const MERGE_QUEUE_FAILURE_WEIGHT = 3;
const TITLE_LENGTH = 100;

function suiteGroup(suite) {
  return suite === 'atomic' || suite === 'quantic' ? suite : 'other';
}

function testKey(suite, {file, title}) {
  return JSON.stringify([suite, file, title]);
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

// Names the step that failed in a merge-queue job in words a reader understands at a glance.
function stepCause(jobName, step) {
  if (/e2e-quantic-setup/.test(step)) {
    return 'Quantic scratch-org setup';
  }
  if (step.endsWith('actions/setup')) {
    return 'Dependency setup';
  }
  if (/playwright-quantic/.test(step)) {
    return 'Quantic e2e tests failed';
  }
  if (/STEPS_PLAYWRIGHT_OUTCOME/.test(step)) {
    return 'Atomic e2e tests failed';
  }
  return step ? `${jobName}: ${step}` : `${jobName}: no failed step reported`;
}

/**
 * Folds the collected CI data into the figures the report shows:
 * - `runCounts`: all runs in the window, and the merge-queue runs among them.
 * - `suites`: for Atomic, Quantic and the other suites, the runs that executed them, and how many
 *   of those had a test that passed only on retry.
 * - `tests`: one row per flaky test with its flaky runs, the merge-queue runs where it failed every
 *   retry, the IDs of both, and the last run that saw it. A failure on every retry counts only in
 *   the merge queue. Rows rank by flaky runs plus three per merge-queue failure.
 * - `mergeQueueCauses`: failed merge-queue runs grouped by cause: the test files that failed every
 *   retry when there are some (kind `test`), otherwise the step that failed (`infrastructure`).
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

  for (const record of records) {
    const run = runsById.get(record.runId);
    const group = groups.get(suiteGroup(record.suite));
    group.runs.add(run.id);
    if (record.flaky > 0) {
      group.flakyRuns.add(run.id);
    }
    for (const test of record.tests ?? []) {
      // A pull request that fails a test on every retry usually broke it: not a flake.
      if (test.outcome === 'failed' && run.event !== 'merge_group') {
        continue;
      }
      if (test.outcome === 'failed') {
        getOrCreate(failedFilesByMergeQueueRun, run.id, () => new Set()).add(fileStem(test.file));
      }
      const entry = getOrCreate(tests, testKey(record.suite, test), () => ({
        suite: record.suite,
        file: test.file,
        line: test.line,
        title: test.title,
        flakyRuns: new Set(),
        failedRuns: new Set(),
        lastSeen: run,
        // Records saved before they held the checked-out commit fall back to the run's head.
        sha: record.sha ?? run.headSha,
      }));
      (test.outcome === 'flaky' ? entry.flakyRuns : entry.failedRuns).add(run.id);
      // The link points at the commit the last run tested, so it takes that run's line too.
      if (run.createdAt > entry.lastSeen.createdAt) {
        entry.lastSeen = run;
        entry.line = test.line;
        entry.sha = record.sha ?? run.headSha;
      }
    }
  }

  const score = (row) => row.flakyRuns + MERGE_QUEUE_FAILURE_WEIGHT * row.failedInMergeQueue;
  const testRows = [...tests.values()]
    .map((entry) => ({
      suite: entry.suite,
      file: entry.file,
      line: entry.line,
      title: entry.title,
      flakyRuns: entry.flakyRuns.size,
      failedInMergeQueue: entry.failedRuns.size,
      runIds: [...entry.flakyRuns.union(entry.failedRuns)].sort((a, b) => a - b),
      lastSeen: {runId: entry.lastSeen.id, createdAt: entry.lastSeen.createdAt},
      sha: entry.sha,
    }))
    .sort((a, b) => score(b) - score(a) || a.title.localeCompare(b.title));

  const causes = new Map();
  for (const failure of mergeQueueFailures) {
    const run = runsById.get(failure.runId);
    const files = failedFilesByMergeQueueRun.get(run.id);
    const cause = files
      ? `Test failed every retry: ${[...files]
          .sort()
          .map((file) => `\`${file}\``)
          .join(', ')}`
      : [...new Set(failure.jobs.map((job) => stepCause(job.name, job.failedStep)))].join(', ') ||
        'No failed job reported';
    getOrCreate(causes, cause, () => ({
      kind: files ? 'test' : 'infrastructure',
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
    mergeQueueCauses,
    recoveries: recoveryRows,
    skips: [...skips].sort((a, b) => b.ageDays - a.ageDays || a.file.localeCompare(b.file)),
  };
}

/**
 * Reduces a one-week model to the snapshot the internal flaky test dashboard stores for that week.
 * The fields are schema 1 of the contract with that dashboard: a breaking change needs a new number.
 */
export function buildSnapshot(model) {
  return {
    schema: 1,
    source: 'report',
    week: {start: model.window.start, end: model.window.end},
    runCounts: {total: model.runCounts.total, mergeQueue: model.runCounts.mergeQueue},
    suites: model.suites.map(({id, runs, flakyRuns}) => ({id, runs, flakyRuns})),
    tests: model.tests.map(({suite, file, title, flakyRuns, failedInMergeQueue, runIds}) => ({
      suite,
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
      '| Test | Suite | Flaky runs | Failed in merge queue | Last seen |',
      '|---|---|---:|---:|---|',
      ...model.tests
        .slice(0, LISTED_TESTS)
        .map((row) =>
          tableRow([
            `${sourceLink(row.sha, row.file, row.line, `\`${fileStem(row.file)}\``)} ${escapeCell(shorten(row.title.split(' › ').pop(), TITLE_LENGTH))}`,
            suiteLabel(row.suite),
            row.flakyRuns,
            row.failedInMergeQueue || '',
            runLink(row.lastSeen),
          ])
        )
    );
    if (model.tests.length > LISTED_TESTS) {
      lines.push('', `${plural(model.tests.length - LISTED_TESTS, 'more flaky test')} not shown.`);
    }
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
