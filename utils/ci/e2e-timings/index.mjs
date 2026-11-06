#!/usr/bin/env node
// Builds and checks utils/ci/e2e-timings/atomic.json, the measured test durations that the
// @flakiness/playwright reporter in packages/atomic/playwright.config.ts uses to give every Atomic
// e2e shard the same amount of test time. The durations come from the blob reports the shards
// upload, kept 5 days.
//
// Usage:
//   node utils/ci/e2e-timings/index.mjs build --latest [--runs 3] [-o <file>]
//   node utils/ci/e2e-timings/index.mjs build --run <id> [--run <id>...] [-o <file>]
//   node utils/ci/e2e-timings/index.mjs check --candidate <file> --shards <n> [--current <file>] [--threshold 5]
//   node utils/ci/e2e-timings/index.mjs publish --candidate <file>
// `build` needs a GITHUB_TOKEN that can read actions (locally: `gh auth token`). It replays each
// run's blob reports through @flakiness/playwright and combines them with its timings CLI, which
// keeps each test's longest run. `--latest` skips runs that replayed another run's reports from
// the Turbo cache, and fails when merge-queue runs have blob reports but none has all its shards.
// `check` predicts the longest shard with the committed file and with the candidate, and writes
// `refresh=true` to GITHUB_OUTPUT when the candidate is worth committing (see decide()).
// `publish` commits the candidate on the branch `ci/atomic-e2e-timings` through the GitHub App
// (GITHUB_INSTALLATION_TOKEN), so the commit is verified, and opens or updates its pull request.
import {execFileSync, spawnSync} from 'node:child_process';
import {appendFileSync, copyFileSync, mkdirSync, mkdtempSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname, join, relative, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {parseArgs} from 'node:util';
import {Octokit} from 'octokit';
import {REPO_NAME, REPO_OWNER} from '../common/constants.mjs';
import {commitChanges, setupGit} from '../common/git.mjs';
import {
  describeRun,
  downloadBlobReports,
  listRunsWithBlobReports,
  reachedMain,
  replayThroughFlakiness,
  untrustedEnv,
} from './collect.mjs';
import {decide, keysOf, readTimings} from './timings.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const ATOMIC = join(ROOT, 'packages/atomic');
const TIMINGS_FILE = join(ROOT, 'utils/ci/e2e-timings/atomic.json');
const BRANCH = 'ci/atomic-e2e-timings';
const PR_TITLE = 'ci(atomic): refresh the e2e shard timings j:KIT-6492';
const RUNS_URL = `https://github.com/${REPO_OWNER}/${REPO_NAME}/actions/runs`;
const BOT_LOGIN = 'developer-experience-bot[bot]';

const {positionals, values: options} = parseArgs({
  allowPositionals: true,
  options: {
    run: {type: 'string', multiple: true},
    latest: {type: 'boolean'},
    runs: {type: 'string', default: '3'},
    output: {type: 'string', short: 'o', default: TIMINGS_FILE},
    candidate: {type: 'string'},
    current: {type: 'string', default: TIMINGS_FILE},
    shards: {type: 'string'},
    threshold: {type: 'string', default: '5'},
  },
});

const seconds = (ms) => `${Math.round(ms / 1000)} s`;

function writeOutputs(outputs) {
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(
      process.env.GITHUB_OUTPUT,
      Object.entries(outputs)
        .map(([name, value]) => `${name}=${value}\n`)
        .join('')
    );
  }
}

async function build() {
  if (!process.env.GITHUB_TOKEN) {
    throw new Error('GITHUB_TOKEN is required.');
  }
  const octokit = new Octokit({auth: process.env.GITHUB_TOKEN});
  const runs = options.latest
    ? await listRunsWithBlobReports(octokit)
    : await Promise.all((options.run ?? []).map((id) => describeRun(octokit, Number(id))));
  if (!runs.length) {
    console.log('No completed merge-queue run still has Atomic blob reports; nothing built.');
    writeOutputs({built: 'false'});
    return;
  }
  const wanted = options.latest ? Number(options.runs) : runs.length;
  const work = mkdtempSync(join(tmpdir(), 'e2e-timings-'));
  try {
    const reports = [];
    const selected = [];
    const seen = new Map();
    let shards = 0;
    for (const run of runs) {
      if (selected.length >= wanted) {
        break;
      }
      if (!(await reachedMain(octokit, run.headSha))) {
        console.log(`Skipping run ${run.id}: its commit never reached main.`);
        continue;
      }
      const blobDirectory = join(work, String(run.id), 'blobs');
      const downloaded = await downloadBlobReports(octokit, run, blobDirectory);
      if (!downloaded.complete) {
        console.log(
          `Skipping run ${run.id}: ${downloaded.blobs.length} of ${downloaded.total || '?'} shards uploaded a blob report.`
        );
        continue;
      }
      if (seen.has(downloaded.fingerprint)) {
        console.log(
          `Skipping run ${run.id}: same blob reports as run ${seen.get(downloaded.fingerprint)}, replayed from the Turbo cache.`
        );
        continue;
      }
      seen.set(downloaded.fingerprint, run.id);
      if (shards && downloaded.total !== shards) {
        console.log(
          `Skipping run ${run.id}: ${downloaded.total} shards, the newest run has ${shards}.`
        );
        continue;
      }
      shards = downloaded.total;
      console.log(`Replaying the ${shards} blob reports of run ${run.id} (${run.createdAt})`);
      reports.push(
        replayThroughFlakiness(blobDirectory, join(work, String(run.id), 'report'), {
          atomicDirectory: ATOMIC,
        })
      );
      selected.push(run.id);
    }
    if (!selected.length) {
      throw new Error(
        `${runs.length} run(s) have Atomic blob reports, but none has a report from every shard.`
      );
    }
    const output = resolve(options.output);
    mkdirSync(dirname(output), {recursive: true});
    execFileSync(
      'pnpm',
      ['exec', 'flakiness-playwright-timings', 'build', ...reports, '-o', output],
      {
        cwd: ATOMIC,
        env: untrustedEnv(),
        stdio: ['ignore', 'ignore', 'inherit'],
      }
    );
    const timings = readTimings(output);
    const durations = [...timings.values()].flatMap((titles) => [...titles.values()]);
    const total = durations.reduce((sum, ms) => sum + ms, 0);
    console.log(
      `${durations.length} tests, ${seconds(total)} of test time, ${seconds(total / shards)} per shard if balanced, from runs ${selected.join(', ')} -> ${output}`
    );
    writeOutputs({built: 'true', shards: String(shards), runs: selected.join(',')});
  } finally {
    rmSync(work, {recursive: true, force: true});
  }
}

function check() {
  if (!options.candidate || !options.shards) {
    throw new Error('check needs --candidate <file> and --shards <n>.');
  }
  // The candidate's tests are the ones the newest runs executed, so no test files need loading.
  const candidate = readTimings(options.candidate);
  const result = decide({
    keys: keysOf(candidate),
    current: readTimings(options.current),
    candidate,
    shards: Number(options.shards),
    thresholdMs: Number(options.threshold) * 1000,
  });
  const summary =
    `${result.tests} tests, ${result.unknown} without a committed duration; longest shard ` +
    `${seconds(result.currentLongest)} with the committed timings, ${seconds(result.candidateLongest)} with the candidate`;
  console.log(`${summary}; refresh: ${result.refresh}`);
  writeOutputs({refresh: String(result.refresh), summary});
  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${summary}; refresh: ${result.refresh}\n`);
  }
}

function git(...args) {
  const result = spawnSync('git', args, {cwd: ROOT, stdio: 'inherit'});
  if (result.status !== 0) {
    throw new Error(`git ${args.join(' ')} failed with status ${result.status}`);
  }
}

async function publish() {
  if (!options.candidate) {
    throw new Error('publish needs --candidate <file>.');
  }
  if (!process.env.GITHUB_INSTALLATION_TOKEN) {
    throw new Error('GITHUB_INSTALLATION_TOKEN is required.');
  }
  const octokit = new Octokit({auth: process.env.GITHUB_INSTALLATION_TOKEN});
  const candidate = resolve(options.candidate);
  // commitChanges() stages the working directory, which `pnpm --filter @coveo/ci` sets to utils/ci.
  process.chdir(ROOT);
  await setupGit();
  // The branch restarts from the checked-out commit on every refresh, so its pull request only
  // ever carries the timings file. commitChanges() fast-forwards the remote branch from there.
  const repository = {owner: REPO_OWNER, repo: REPO_NAME};
  // Anyone with write access can push this branch, so publishing stops, before touching it, when an
  // open pull request uses it that the bot did not open against main.
  const {data: open} = await octokit.rest.pulls.list({
    ...repository,
    state: 'open',
    head: `${REPO_OWNER}:${BRANCH}`,
  });
  const foreign = open.filter(({user, base}) => user?.login !== BOT_LOGIN || base.ref !== 'main');
  if (foreign.length) {
    throw new Error(
      `Not publishing: ${foreign.map(({html_url}) => html_url).join(', ')} uses ${BRANCH} but ${BOT_LOGIN} did not open it against main.`
    );
  }
  git('checkout', '-B', BRANCH);
  git('push', '--force', '--set-upstream', 'origin', BRANCH);
  copyFileSync(candidate, TIMINGS_FILE);
  // commitChanges() commits the whole working tree into a pull request that auto-merges, so the
  // publish stops if anything besides the timings file changed.
  const unexpected = execFileSync('git', ['status', '--porcelain', '--untracked-files=all'], {
    cwd: ROOT,
    encoding: 'utf8',
  })
    .split('\n')
    .filter(Boolean)
    .map((line) => line.slice(3))
    .filter((path) => path !== relative(ROOT, TIMINGS_FILE));
  if (unexpected.length) {
    throw new Error(`Not publishing: files besides the timings changed: ${unexpected.join(', ')}`);
  }
  const sha = await commitChanges(PR_TITLE, octokit);
  const sources = (process.env.SOURCE_RUNS ?? '')
    .split(',')
    .filter(Boolean)
    .map((id) => `[${id}](${RUNS_URL}/${id})`);
  const body = [
    '[KIT-6492](https://coveord.atlassian.net/browse/KIT-6492)',
    '',
    `Rebuilt with \`flakiness-playwright-timings\` from merge-queue runs ${sources.join(', ') || 'listed in the workflow log'}.`,
    '',
    process.env.CHECK_SUMMARY ?? '',
  ].join('\n');
  let pullRequest = open[0];
  if (pullRequest) {
    await octokit.rest.pulls.update({...repository, pull_number: pullRequest.number, body});
  } else {
    ({data: pullRequest} = await octokit.rest.pulls.create({
      ...repository,
      base: 'main',
      head: BRANCH,
      title: PR_TITLE,
      body,
    }));
  }
  try {
    await octokit.graphql(
      `mutation ($id: ID!) {
        enablePullRequestAutoMerge(input: {pullRequestId: $id, mergeMethod: SQUASH}) { clientMutationId }
      }`,
      {id: pullRequest.node_id}
    );
  } catch (error) {
    console.warn(`Auto-merge not enabled: ${error.message}`);
  }
  console.log(`${pullRequest.html_url} (${sha.slice(0, 10)})`);
  writeOutputs({'pull-request': pullRequest.html_url});
}

const commands = {build, check, publish};
const command = commands[positionals[0]];
if (!command) {
  throw new Error(`Unknown command "${positionals[0] ?? ''}"; use build, check or publish.`);
}
await command();
