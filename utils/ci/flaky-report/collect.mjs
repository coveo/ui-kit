// Reads a week of CI data from GitHub and the checkout for the flaky test report.
import {execFileSync} from 'node:child_process';
import {mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {DAY_IN_MS} from '../common/constants.mjs';
import {parseRecordName} from '../playwright-record-reporter.mjs';

const WORKFLOW = 'ci.yml';
const CONCURRENCY = 6;
// The jobs endpoints return HTTP 502 with larger pages on this repository.
const JOBS_PER_PAGE = 30;
// These jobs only fail after another job failed, so they never explain a failure.
const DOWNSTREAM_JOB = /^Confirm build is valid|Merge Playwright reports$/;
const SKIP_PATTERN = String.raw`(?<![\w.])(test|it|describe)\.(skip|fixme)\(|(?<![\w.])x(it|describe)\(`;
// A Jira key, or a GitHub issue written as "Issue #6691".
const TICKET = /\b(?:KIT|SFINT)-\d+\b|(?<=\bissue )#\d+\b/i;
// CONTRIBUTING.md keeps the `style` type for formatting-only commits. Blame skips them, so a
// reformat doesn't reset how long a test has been skipped.
const FORMATTING_COMMIT = String.raw`^style(\([^)]*\))?!?:`;

export function isRateLimited(error) {
  if (error?.status === 429) {
    return true;
  }
  return (
    error?.status === 403 &&
    (error.response?.headers?.['x-ratelimit-remaining'] === '0' ||
      /rate limit/i.test(error.message ?? ''))
  );
}

// Runs `collect` for each run, a few at a time. A rate limit that outlasts octokit's own retries
// stops nothing: that run is left out and the report says its data is partial.
async function forEachRun(runs, collect) {
  let next = 0;
  let partial = false;
  const worker = async () => {
    while (next < runs.length) {
      const run = runs[next++];
      try {
        await collect(run);
      } catch (error) {
        if (!isRateLimited(error)) {
          throw error;
        }
        partial = true;
      }
    }
  };
  await Promise.all(Array.from({length: Math.min(CONCURRENCY, runs.length)}, worker));
  return partial;
}

export function jobFamily(name) {
  return name.replace(/ \(\d+, \d+\)$/, '');
}

export function toRun(run) {
  return {
    id: run.id,
    event: run.event,
    conclusion: run.conclusion,
    createdAt: run.created_at,
    attempts: run.run_attempt,
  };
}

function isoDate(time) {
  return new Date(time).toISOString().slice(0, 10);
}

// The runs endpoint returns at most 1,000 runs per date filter, and a month of CI has more, so the
// window is read a week at a time.
export async function listRuns({octokit, owner, repo}, {start, end}) {
  const runs = new Map();
  for (let from = Date.parse(isoDate(start)); from <= Date.parse(end); from += 7 * DAY_IN_MS) {
    const week = await octokit.paginate(octokit.rest.actions.listWorkflowRuns, {
      owner,
      repo,
      workflow_id: WORKFLOW,
      status: 'completed',
      created: `${isoDate(from)}..${isoDate(from + 6 * DAY_IN_MS)}`,
      per_page: 100,
    });
    for (const run of week) {
      if (run.created_at >= start && run.created_at <= end) {
        runs.set(run.id, toRun(run));
      }
    }
  }
  return [...runs.values()];
}

function readRecordArchive(archive) {
  const directory = mkdtempSync(join(tmpdir(), 'flaky-report-'));
  try {
    const zip = join(directory, 'record.zip');
    writeFileSync(zip, Buffer.from(archive));
    execFileSync('unzip', ['-qq', zip, '-d', join(directory, 'record')]);
    const [file] = readdirSync(join(directory, 'record')).filter((name) => name.endsWith('.json'));
    return file ? JSON.parse(readFileSync(join(directory, 'record', file), 'utf8')) : null;
  } finally {
    rmSync(directory, {recursive: true, force: true});
  }
}

/**
 * Lists each run's record artifacts. Most records come from their names alone; only the ones
 * with retries or failures are downloaded for their test details.
 */
export async function collectRecords({octokit, owner, repo}, runs) {
  const records = [];
  let downloads = 0;
  const partial = await forEachRun(runs, async (run) => {
    const artifacts = await octokit.paginate(octokit.rest.actions.listWorkflowRunArtifacts, {
      owner,
      repo,
      run_id: run.id,
      per_page: 100,
    });
    const runRecords = [];
    for (const artifact of artifacts) {
      const parsed = artifact.expired ? null : parseRecordName(artifact.name);
      if (!parsed) {
        continue;
      }
      const record = {
        runId: run.id,
        suite: parsed.suite,
        flaky: parsed.flaky,
        failed: parsed.failed,
      };
      if (parsed.flaky > 0 || parsed.failed > 0) {
        downloads++;
        const {data} = await octokit.rest.actions.downloadArtifact({
          owner,
          repo,
          artifact_id: artifact.id,
          archive_format: 'zip',
        });
        record.tests = readRecordArchive(data)?.tests ?? [];
      }
      runRecords.push(record);
    }
    // A run counts whole or not at all, so a rate limit halfway through skews no rate.
    records.push(...runRecords);
  });
  return {records, downloads, partial};
}

/** Returns the jobs that failed in one attempt of a run, then passed in a later attempt. */
export function recoveredJobs(attempts) {
  const conclusions = new Map();
  for (const jobs of attempts) {
    for (const {name, conclusion} of jobs) {
      if (!conclusions.has(name)) {
        conclusions.set(name, []);
      }
      conclusions.get(name).push(conclusion);
    }
  }
  return [...conclusions]
    .filter(
      ([name, list]) =>
        !DOWNSTREAM_JOB.test(name) && list.includes('failure') && list.at(-1) === 'success'
    )
    .map(([name]) => jobFamily(name));
}

export async function collectRecoveries({octokit, owner, repo}, runs) {
  const recoveries = [];
  const partial = await forEachRun(
    runs.filter((run) => run.attempts > 1),
    async (run) => {
      const attempts = [];
      for (let attempt = 1; attempt <= run.attempts; attempt++) {
        attempts.push(
          await octokit.paginate(octokit.rest.actions.listJobsForWorkflowRunAttempt, {
            owner,
            repo,
            run_id: run.id,
            attempt_number: attempt,
            per_page: JOBS_PER_PAGE,
          })
        );
      }
      for (const job of recoveredJobs(attempts)) {
        recoveries.push({runId: run.id, job});
      }
    }
  );
  return {recoveries, partial};
}

/** Returns a run's failed jobs, without the downstream jobs, each with the step that failed. */
export function failedJobs(jobs) {
  return jobs
    .filter((job) => job.conclusion === 'failure' && !DOWNSTREAM_JOB.test(job.name))
    .map((job) => ({
      name: jobFamily(job.name),
      failedStep: job.steps?.find((step) => step.conclusion === 'failure')?.name ?? '',
    }));
}

export async function collectMergeQueueFailures({octokit, owner, repo}, runs) {
  const failures = [];
  const partial = await forEachRun(
    runs.filter((run) => run.event === 'merge_group' && run.conclusion === 'failure'),
    async (run) => {
      const jobs = await octokit.paginate(octokit.rest.actions.listJobsForWorkflowRun, {
        owner,
        repo,
        run_id: run.id,
        filter: 'latest',
        per_page: JOBS_PER_PAGE,
      });
      failures.push({runId: run.id, jobs: failedJobs(jobs)});
    }
  );
  return {failures, partial};
}

/** Parses `git grep -n` output into the file and line of each match. */
function parseSkipMatches(output) {
  return output
    .split('\n')
    .filter(Boolean)
    .map((match) => {
      const [file, line] = match.split(':');
      return {file, line: Number(line)};
    });
}

export function findTicket(text) {
  return TICKET.exec(text)?.[0].toUpperCase() ?? null;
}

function git(repositoryRoot, args) {
  return execFileSync('git', args, {
    cwd: repositoryRoot,
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024,
  });
}

/** Lists the skipped tests in the checkout, with how long each has been skipped and its ticket. */
export function collectSkips({repositoryRoot, now}) {
  let output;
  try {
    output = git(repositoryRoot, [
      'grep',
      '-nP',
      SKIP_PATTERN,
      '--',
      'packages',
      'samples',
      ':(exclude)**/node_modules/**',
    ]);
  } catch (error) {
    if (error.status === 1) {
      return [];
    }
    throw error;
  }
  const directory = mkdtempSync(join(tmpdir(), 'flaky-report-'));
  try {
    const formattingCommits = join(directory, 'formatting-commits');
    writeFileSync(
      formattingCommits,
      git(repositoryRoot, [
        'log',
        '--format=%H',
        '--extended-regexp',
        `--grep=${FORMATTING_COMMIT}`,
      ])
    );
    return parseSkipMatches(output).map(({file, line}) => {
      const source = readFileSync(join(repositoryRoot, file), 'utf8').split('\n');
      const blame = git(repositoryRoot, [
        'blame',
        '--porcelain',
        '--ignore-revs-file',
        formattingCommits,
        '-L',
        `${line},${line}`,
        '--',
        file,
      ]);
      const authorTime = Number(/^author-time (\d+)$/m.exec(blame)?.[1] ?? 0);
      return {
        file,
        line,
        ageDays: Math.floor((now.getTime() - authorTime * 1000) / DAY_IN_MS),
        ticket: findTicket(source.slice(Math.max(0, line - 4), line).join('\n')),
      };
    });
  } finally {
    rmSync(directory, {recursive: true, force: true});
  }
}
