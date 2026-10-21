import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import {failedJobs, recoveredJobs, toRun} from './collect.mjs';
import api from './fixtures/ci-api.json' with {type: 'json'};
import recordRun from './fixtures/records.json' with {type: 'json'};
import {buildModel, renderReport, suiteGroup} from './report.mjs';

const REPOSITORY = 'https://github.com/coveo/ui-kit';
const QUANTIC_SHARDS = 'Run Quantic E2E tests / Run Playwright e2e tests on Quantic';
const window = {start: '2026-09-22T14:00:00.000Z', end: '2026-10-22T14:00:00.000Z'};
const context = {repositoryUrl: REPOSITORY, ref: 'main', jiraUrl: 'https://coveord.atlassian.net'};
const records = recordRun.records.map((record) => ({
  runId: recordRun.runId,
  suite: record.suite,
  flaky: record.counts.flaky,
  failed: record.counts.failed,
  tests: record.tests,
}));
const [agentTest, sortTest] = recordRun.records.flatMap((record) => record.tests ?? []);
// From the skipped-test scan of main on Oct 21, 2026.
const skips = [
  {
    file: 'packages/atomic/src/components/search/atomic-notifications/atomic-notifications.spec.ts',
    line: 178,
    ageDays: 313,
    ticket: 'KIT-5197',
  },
  {
    file: 'packages/atomic/src/components/search/atomic-rating-facet/e2e/atomic-rating-facet.e2e.ts',
    line: 85,
    ageDays: 316,
    ticket: '#6691',
  },
  {
    file: 'packages/headless/src/integration-tests/commerce.test.ts',
    line: 21,
    ageDays: 1114,
    ticket: null,
  },
];

function input(overrides = {}) {
  return {
    window,
    runs: api.runs.map(toRun),
    records,
    recoveries: recoveredJobs(api.rerunAttempts.attempts).map((job) => ({
      runId: api.rerunAttempts.runId,
      job,
    })),
    mergeQueueFailures: Object.entries(api.mergeQueueJobs).map(([runId, jobs]) => ({
      runId: Number(runId),
      jobs: failedJobs(jobs),
    })),
    skips,
    ...overrides,
  };
}

function withRecord(record) {
  return input({records: [...records, record]});
}

describe('suiteGroup', () => {
  it('groups the samples and smoke tests together', () => {
    assert.deepEqual(
      ['atomic', 'quantic', 'atomic-hosted-page-cdn', 'headless-ssr-search-nextjs'].map(suiteGroup),
      ['atomic', 'quantic', 'other', 'other']
    );
  });
});

describe('buildModel', () => {
  const model = buildModel(input());

  it('counts the runs that ran each suite and the runs with a flaky test', () => {
    assert.deepEqual(model.suites, [
      {label: 'Atomic', runs: 1, flakyRuns: 0},
      {label: 'Quantic', runs: 1, flakyRuns: 1},
      {label: 'Samples and smoke tests', runs: 1, flakyRuns: 0},
    ]);
  });

  it('ranks the tests that passed only on retry', () => {
    assert.deepEqual(
      model.tests.map(({file, flakyRuns, failedInMergeQueue, lastSeen}) => ({
        file,
        flakyRuns,
        failedInMergeQueue,
        lastSeen: lastSeen.runId,
      })),
      [
        {file: agentTest.file, flakyRuns: 1, failedInMergeQueue: 0, lastSeen: recordRun.runId},
        {file: sortTest.file, flakyRuns: 1, failedInMergeQueue: 0, lastSeen: recordRun.runId},
      ]
    );
  });

  it('counts a run once when a test is flaky in both Quantic LWS modes', () => {
    const [top] = buildModel(
      withRecord({
        runId: api.rerunAttempts.runId,
        suite: 'quantic',
        flaky: 2,
        failed: 0,
        tests: [agentTest, agentTest],
      })
    ).tests;
    assert.equal(top.file, agentTest.file);
    assert.equal(top.flakyRuns, 2);
  });

  it('groups the merge-queue failures by cause', () => {
    assert.deepEqual(
      model.mergeQueueCauses.map(({cause, runs}) => ({cause, runs: runs.map(({runId}) => runId)})),
      [
        {cause: 'Dependency setup', runs: [38802776862]},
        {cause: 'Quantic e2e shard stopped without a test failure', runs: [38909948473]},
      ]
    );
  });

  it('names an Atomic e2e failure that left no record', () => {
    const {mergeQueueCauses} = buildModel(
      input({
        mergeQueueFailures: [
          {
            runId: 38909948473,
            jobs: [
              {
                name: 'Run Playwright tests for Atomic',
                failedStep: "Run if [[ ${STEPS_PLAYWRIGHT_OUTCOME} == 'failure' ]];",
              },
            ],
          },
        ],
      })
    );
    assert.deepEqual(
      mergeQueueCauses.map(({cause}) => cause),
      ['Atomic e2e tests failed']
    );
  });

  it('counts the jobs that only passed after a re-run', () => {
    assert.deepEqual(model.recoveries, [
      {job: QUANTIC_SHARDS, count: 4, lastRunId: api.rerunAttempts.runId},
    ]);
  });

  it('blames a merge-queue failure on the test that failed every retry, and ranks it first', () => {
    const {tests, mergeQueueCauses} = buildModel(
      withRecord({
        runId: 38909948473,
        suite: 'quantic',
        flaky: 0,
        failed: 1,
        tests: [{...sortTest, outcome: 'failed'}],
      })
    );
    assert.equal(tests[0].file, sortTest.file);
    assert.equal(tests[0].failedInMergeQueue, 1);
    assert.deepEqual(
      mergeQueueCauses.map(({cause}) => cause),
      ['Dependency setup', 'Test failed every retry: `quanticSort`']
    );
  });

  it('ignores a pull request that fails a test on every retry', () => {
    const {tests} = buildModel(
      withRecord({
        runId: api.rerunAttempts.runId,
        suite: 'quantic',
        flaky: 0,
        failed: 1,
        tests: [{...agentTest, outcome: 'failed'}],
      })
    );
    assert.deepEqual(
      tests.map(({failedInMergeQueue}) => failedInMergeQueue),
      [0, 0]
    );
  });
});

describe('renderReport', () => {
  const report = renderReport(buildModel(input()), context);
  const lines = report.body.split('\n');

  it('opens with the period and the runs with a flaky test in each suite', () => {
    assert.equal(
      lines[0],
      '**Sep 22 to Oct 22**, 4 CI runs. Runs with a flaky test, out of the runs that ran each suite: Atomic 0 of 1, Quantic 1 of 1, Samples and smoke tests 0 of 1.'
    );
  });

  it('links each flaky test to its source and to the last run where it needed a retry', () => {
    assert.ok(
      lines.includes(
        `| [\`quanticGeneratedAnswerAgent\`](${REPOSITORY}/blob/main/${agentTest.file}#L22) should handle multiple answer generation, feedback, clipboard, citation, and follow-up interactions | Quantic | 1 |  | [Oct 21](${REPOSITORY}/actions/runs/39610965567) |`
      )
    );
    assert.ok(
      lines.includes(
        `| [\`quanticSort\`](${REPOSITORY}/blob/main/${sortTest.file}#L31) should trigger a new search and log analytics | Quantic | 1 |  | [Oct 21](${REPOSITORY}/actions/runs/39610965567) |`
      )
    );
  });

  it('lists the merge-queue failures by cause', () => {
    assert.ok(lines.includes('2 of 2 merge-queue runs failed.'));
    assert.ok(
      lines.includes(`| Dependency setup | [Oct 15](${REPOSITORY}/actions/runs/38802776862) |`)
    );
  });

  it('lists the jobs that passed only after a re-run', () => {
    assert.ok(
      lines.includes(`| ${QUANTIC_SHARDS} | 4 | [run](${REPOSITORY}/actions/runs/38792310328) |`)
    );
  });

  it('lists the skipped tests, oldest first, with their ticket', () => {
    assert.ok(lines.includes('3 skipped tests, 1 without a ticket nearby.'));
    assert.deepEqual(
      lines.filter((line) => /^\| [\d,]+ days \| /.test(line)),
      [
        `| 1,114 days | [commerce.test.ts:21](${REPOSITORY}/blob/main/packages/headless/src/integration-tests/commerce.test.ts#L21) | none |`,
        `| 316 days | [atomic-rating-facet.e2e.ts:85](${REPOSITORY}/blob/main/packages/atomic/src/components/search/atomic-rating-facet/e2e/atomic-rating-facet.e2e.ts#L85) | [#6691](${REPOSITORY}/issues/6691) |`,
        `| 313 days | [atomic-notifications.spec.ts:178](${REPOSITORY}/blob/main/packages/atomic/src/components/search/atomic-notifications/atomic-notifications.spec.ts#L178) | [KIT-5197](https://coveord.atlassian.net/browse/KIT-5197) |`,
      ]
    );
  });

  it('sums the window up in the comment', () => {
    assert.equal(
      report.comment,
      '**Sep 22 to Oct 22:** 2 flaky tests, led by `quanticGeneratedAnswerAgent`. 2 of 2 merge-queue runs failed.'
    );
  });

  it('says so when nothing needed a retry', () => {
    const empty = renderReport(
      buildModel(input({records: [], recoveries: [], mergeQueueFailures: []})),
      context
    );
    const emptyLines = empty.body.split('\n');
    assert.ok(emptyLines.includes('No test needed a retry.'));
    assert.ok(emptyLines.includes('0 of 2 merge-queue runs failed.'));
    assert.ok(emptyLines.includes('No job needed a re-run.'));
    assert.equal(
      empty.comment,
      '**Sep 22 to Oct 22:** no flaky test. 0 of 2 merge-queue runs failed.'
    );
  });

  it('shows the five jobs re-run most often', () => {
    const jobs = ['A', 'B', 'C', 'D', 'E', 'F'].map((letter) => `Job ${letter}`);
    const {body} = renderReport(
      buildModel(input({recoveries: jobs.map((job) => ({runId: api.rerunAttempts.runId, job}))})),
      context
    );
    const bodyLines = body.split('\n');
    assert.ok(bodyLines.some((line) => line.startsWith('| Job E | 1 |')));
    assert.ok(!bodyLines.some((line) => line.startsWith('| Job F | 1 |')));
    assert.ok(bodyLines.includes('1 more job not shown.'));
  });

  it('warns when the rate limit left runs out', () => {
    assert.match(
      renderReport(buildModel(input()), {...context, partial: true}).body,
      /> \[!WARNING\]\n> The API rate limit stopped the collection early/
    );
  });

  it('keeps a pipe or a backslash in a test title inside its cell', () => {
    const title = String.raw`quantic search box › should search for C:\docs|archive`;
    const {body} = renderReport(
      buildModel(
        input({
          records: [
            {
              runId: recordRun.runId,
              suite: 'quantic',
              flaky: 1,
              failed: 0,
              tests: [{...agentTest, title}],
            },
          ],
        })
      ),
      context
    );
    assert.ok(body.includes(String.raw` should search for C:\\docs\|archive | Quantic | `));
  });
});
