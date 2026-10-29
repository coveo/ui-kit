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
const SKIP_PATTERN = String.raw`(?<![\w.])(test|it|describe)\.(skip|fixme)(\(|\.each[(<])|(?<![\w.])x(it|describe)\(`;
// A Jira key, or a GitHub issue written as "Issue #6691".
const TICKET = /\b(?:KIT|SFINT)-\d+\b|(?<=\bissue )#\d+\b/i;
// CONTRIBUTING.md keeps the `style` type for formatting-only commits. Blame skips them, so a
// reformat doesn't reset how long a test has been skipped.
const FORMATTING_COMMIT = String.raw`^style(\([^)]*\))?!?:`;

async function forEachRun(runs, collect) {
  let next = 0;
  const worker = async () => {
    while (next < runs.length) {
      await collect(runs[next++]);
    }
  };
  await Promise.all(Array.from({length: Math.min(CONCURRENCY, runs.length)}, worker));
}

function jobFamily(name) {
  return name.replace(/ \(\d+, \d+\)$/, '');
}

function toRun(run) {
  return {
    id: run.id,
    event: run.event,
    conclusion: run.conclusion,
    createdAt: run.created_at,
    headSha: run.head_sha,
    attempts: run.run_attempt,
  };
}

function isoDate(time) {
  return new Date(time).toISOString().slice(0, 10);
}

/**
 * Lists the completed `ci.yml` runs created inside the window, each reduced to the fields the
 * report needs. The runs endpoint returns at most 1,000 runs per date filter, and a month of CI has
 * more, so the window is read a week at a time.
 */
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
 * Reads the record each Playwright job uploaded, for every run. A record holds one job's counts of
 * passed, flaky and failed tests (see `playwright-record-reporter.mjs`). The counts come from the
 * artifact name alone; only records with a retry or a failure are downloaded, to get each of those
 * tests' file, line and title.
 */
export async function collectRecords({octokit, owner, repo}, runs) {
  const records = [];
  await forEachRun(runs, async (run) => {
    const artifacts = await octokit.paginate(octokit.rest.actions.listWorkflowRunArtifacts, {
      owner,
      repo,
      run_id: run.id,
      per_page: 100,
    });
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
        const {data} = await octokit.rest.actions.downloadArtifact({
          owner,
          repo,
          artifact_id: artifact.id,
          archive_format: 'zip',
        });
        const content = readRecordArchive(data);
        record.sha = content?.sha;
        record.tests = content?.tests ?? [];
      }
      records.push(record);
    }
  });
  return records;
}

function recoveredJobs(attempts) {
  const conclusions = new Map();
  for (const jobs of attempts) {
    for (const {name, conclusion} of jobs) {
      if (!conclusions.has(name)) {
        conclusions.set(name, []);
      }
      conclusions.get(name).push(conclusion);
    }
  }
  const recovered = [...conclusions]
    .filter(
      ([name, list]) =>
        !DOWNSTREAM_JOB.test(name) && list.includes('failure') && list.at(-1) === 'success'
    )
    .map(([name]) => jobFamily(name));
  // The shards of a matrix job share one family, so a run counts once per job.
  return [...new Set(recovered)];
}

/**
 * Finds the jobs that only passed after "Re-run failed jobs". In each run with more than one
 * attempt, a job counts when it failed in some attempt and succeeded in the last one. Downstream
 * jobs, which only fail because another job did, are ignored.
 */
export async function collectRecoveries({octokit, owner, repo}, runs) {
  const recoveries = [];
  await forEachRun(
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
  return recoveries;
}

function failedJobs(jobs) {
  return jobs
    .filter((job) => job.conclusion === 'failure' && !DOWNSTREAM_JOB.test(job.name))
    .map((job) => ({
      name: jobFamily(job.name),
      failedStep: job.steps?.find((step) => step.conclusion === 'failure')?.name ?? '',
    }));
}

/**
 * Lists, for each failed merge-queue run, the jobs that failed and the step that failed in each.
 * Downstream jobs are left out, so every entry points at an actual cause.
 */
export async function collectMergeQueueFailures({octokit, owner, repo}, runs) {
  const failures = [];
  await forEachRun(
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
  return failures;
}

function parseSkipMatches(output) {
  return output
    .split('\n')
    .filter(Boolean)
    .map((match) => {
      const [file, line] = match.split(':');
      return {file, line: Number(line)};
    });
}

function findTicket(text) {
  return TICKET.exec(text)?.[0].toUpperCase() ?? null;
}

function git(cwd, args) {
  return execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024,
  });
}

/**
 * Lists the skipped tests on the checked-out commit. Each one is dated with `git blame` on its skip
 * line, ignoring formatting-only commits, and gets the first ticket key found on that line or the
 * three lines above it.
 */
export function collectSkips() {
  const repositoryRoot = git('.', ['rev-parse', '--show-toplevel']).trim();
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
  const ignoredFormattingCommits = git(repositoryRoot, [
    'log',
    '--format=%H',
    '--extended-regexp',
    `--grep=${FORMATTING_COMMIT}`,
  ])
    .split('\n')
    .filter(Boolean)
    .flatMap((sha) => ['--ignore-rev', sha]);
  return parseSkipMatches(output).map(({file, line}) => {
    const source = readFileSync(join(repositoryRoot, file), 'utf8').split('\n');
    const blame = git(repositoryRoot, [
      'blame',
      '--porcelain',
      ...ignoredFormattingCommits,
      '-L',
      `${line},${line}`,
      '--',
      file,
    ]);
    const authorTime = Number(/^author-time (\d+)$/m.exec(blame)?.[1] ?? 0);
    return {
      file,
      line,
      ageDays: Math.floor((Date.now() - authorTime * 1000) / DAY_IN_MS),
      ticket: findTicket(source.slice(Math.max(0, line - 4), line).join('\n')),
    };
  });
}
