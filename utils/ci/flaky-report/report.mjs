// Turns the CI data of the report's window into the flaky test report. Pure functions only:
// collect.mjs does the I/O, so everything here can be tested with plain objects.
export const ISSUE_TITLE = 'Flaky test report';

const GROUPS = {atomic: 'Atomic', quantic: 'Quantic', other: 'Samples and smoke tests'};
const LISTED_TESTS = 20;
const LISTED_JOBS = 5;
const MERGE_QUEUE_FAILURE_WEIGHT = 3;
const TITLE_LENGTH = 100;

export function suiteGroup(suite) {
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
    return 'Quantic e2e shard stopped without a test failure';
  }
  if (/STEPS_PLAYWRIGHT_OUTCOME/.test(step)) {
    return 'Atomic e2e tests failed';
  }
  return step ? `${jobName}: ${step}` : `${jobName}: no failed step reported`;
}

/**
 * @param {object} input
 * @param {{start: string, end: string}} input.window ISO timestamps.
 * @param {Array<{id: number, event: string, createdAt: string}>} input.runs
 * @param {Array<{runId: number, suite: string, flaky: number, failed: number, tests?: Array<object>}>} input.records
 * @param {Array<{runId: number, job: string}>} input.recoveries
 * @param {Array<{runId: number, jobs: Array<{name: string, failedStep: string}>}>} input.mergeQueueFailures
 * @param {Array<{file: string, line: number, ageDays: number, ticket: string | null}>} input.skips
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
    if (!run) {
      continue;
    }
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
      }));
      (test.outcome === 'flaky' ? entry.flakyRuns : entry.failedRuns).add(run.id);
      if (run.createdAt > entry.lastSeen.createdAt) {
        entry.lastSeen = run;
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
      lastSeen: {runId: entry.lastSeen.id, createdAt: entry.lastSeen.createdAt},
    }))
    .sort((a, b) => score(b) - score(a) || a.title.localeCompare(b.title));

  const causes = new Map();
  for (const failure of mergeQueueFailures) {
    const run = runsById.get(failure.runId);
    if (!run) {
      continue;
    }
    const files = failedFilesByMergeQueueRun.get(run.id);
    const cause = files
      ? `Test failed every retry: ${[...files]
          .sort()
          .map((file) => `\`${file}\``)
          .join(', ')}`
      : [...new Set(failure.jobs.map((job) => stepCause(job.name, job.failedStep)))].join(', ') ||
        'No failed job reported';
    getOrCreate(causes, cause, () => []).push({runId: run.id, createdAt: run.createdAt});
  }
  const mergeQueueCauses = [...causes]
    .map(([cause, causeRuns]) => ({
      cause,
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

function ticketLink(ticket, {repositoryUrl, jiraUrl}) {
  const url = ticket.startsWith('#')
    ? `${repositoryUrl}/issues/${ticket.slice(1)}`
    : `${jiraUrl}/browse/${ticket}`;
  return `[${ticket}](${url})`;
}

/**
 * @param {ReturnType<typeof buildModel>} model
 * @param {{repositoryUrl: string, ref: string, jiraUrl: string, partial?: boolean}} context
 * @returns {{title: string, body: string, comment: string}}
 */
export function renderReport(model, {repositoryUrl, ref, jiraUrl, partial}) {
  const runLink = ({runId, createdAt}) =>
    `[${formatDate(createdAt)}](${repositoryUrl}/actions/runs/${runId})`;
  const sourceLink = (file, line, text) =>
    `[${text}](${repositoryUrl}/blob/${ref}/${file}#L${line})`;
  const period = `${formatDate(model.window.start)} to ${formatDate(model.window.end)}`;
  const failedRuns = model.mergeQueueCauses.reduce((total, row) => total + row.runs.length, 0);
  const mergeQueue = `${failedRuns} of ${plural(model.runCounts.mergeQueue, 'merge-queue run')} failed.`;
  const suites = model.suites
    .map((suite) => `${suite.label} ${suite.flakyRuns} of ${suite.runs}`)
    .join(', ');

  const lines = [
    `**${period}**, ${plural(model.runCounts.total, 'CI run')}. Runs with a flaky test, out of the runs that ran each suite: ${suites}.`,
  ];
  if (partial) {
    lines.push(
      '',
      '> [!WARNING]',
      '> The API rate limit stopped the collection early, so some runs are missing from this report.'
    );
  }

  lines.push('', '## Flaky tests', '');
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
            `${sourceLink(row.file, row.line, `\`${fileStem(row.file)}\``)} ${escapeCell(shorten(row.title.split(' › ').pop(), TITLE_LENGTH))}`,
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
            `[run](${repositoryUrl}/actions/runs/${row.lastRunId})`,
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
          sourceLink(skip.file, skip.line, `${skip.file.split('/').pop()}:${skip.line}`),
          skip.ticket ? ticketLink(skip.ticket, {repositoryUrl, jiraUrl}) : 'none',
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

  return {title: ISSUE_TITLE, body: `${lines.join('\n')}\n`, comment};
}
