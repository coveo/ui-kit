// Reads the blob reports the Atomic shards upload (artifacts `atomic-blob-report-<n>`, kept
// 5 days) and replays each run through @flakiness/playwright, whose report its timings CLI reads.
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {
  constants,
  copyFileSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import {join} from 'node:path';
import {REPO_NAME, REPO_OWNER} from '../common/constants.mjs';

const WORKFLOW = 'ci.yml';
const BLOB_ARTIFACT = /^atomic-blob-report-(\d+)$/;

function toRun(run) {
  return {
    id: run.id,
    url: run.html_url,
    createdAt: run.created_at,
    event: run.event,
    headSha: run.head_sha,
  };
}

async function blobArtifacts(octokit, runId) {
  const artifacts = await octokit.paginate(octokit.rest.actions.listWorkflowRunArtifacts, {
    owner: REPO_OWNER,
    repo: REPO_NAME,
    run_id: runId,
    per_page: 100,
  });
  return artifacts
    .filter((artifact) => !artifact.expired && BLOB_ARTIFACT.test(artifact.name))
    .map((artifact) => ({id: artifact.id, name: artifact.name}));
}

/**
 * Whether `sha` is on main. A merge-queue run tests the commit main moves to, so this keeps only
 * runs whose code was merged.
 */
export async function reachedMain(octokit, sha) {
  try {
    const {data} = await octokit.rest.repos.compareCommitsWithBasehead({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      basehead: `${sha}...main`,
      per_page: 1,
    });
    return data.status === 'ahead' || data.status === 'identical';
  } catch (error) {
    if (error.status === 404) {
      return false;
    }
    throw error;
  }
}

/** The environment for tools that read artifact data, without the job's GitHub token. */
export function untrustedEnv(extra = {}) {
  const env = {...process.env, ...extra};
  delete env.GITHUB_TOKEN;
  delete env.GH_TOKEN;
  return env;
}

export async function describeRun(octokit, runId) {
  const {data} = await octokit.rest.actions.getWorkflowRun({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    run_id: runId,
  });
  return {...toRun(data), artifacts: await blobArtifacts(octokit, runId)};
}

/**
 * The newest successful merge-queue runs that still have Atomic blob reports, newest first.
 * Pull-request and failed runs are left out: their code never reached main, and this job runs on
 * main, so their reports must not feed it.
 */
export async function listRunsWithBlobReports(octokit) {
  const {data} = await octokit.rest.actions.listWorkflowRuns({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    workflow_id: WORKFLOW,
    event: 'merge_group',
    status: 'success',
    per_page: 50,
  });
  const runs = [];
  for (const run of data.workflow_runs) {
    const artifacts = await blobArtifacts(octokit, run.id);
    if (artifacts.length) {
      runs.push({...toRun(run), artifacts});
    }
  }
  return runs;
}

/** The `{current, total}` shard a blob report's first event records. */
function shardOf(firstLine) {
  const {method, params} = JSON.parse(firstLine);
  const {current, total} = params?.shard ?? {};
  if (method !== 'onBlobReportMetadata' || !Number.isInteger(current) || !Number.isInteger(total)) {
    throw new Error('not a sharded Playwright blob report');
  }
  return {current, total};
}

/**
 * Whether the shards cover 1..total exactly once, the total coming from the reports themselves:
 * merge-queue shards fail fast, and a cancelled shard uploads nothing.
 */
function isComplete(shards) {
  const total = shards[0]?.total;
  const seen = new Set(shards.map(({current}) => current));
  return (
    Boolean(total) &&
    shards.every((shard) => shard.total === total) &&
    seen.size === shards.length &&
    shards.length === total &&
    [...seen].every((current) => current >= 1 && current <= total)
  );
}

/**
 * Identifies an execution by the bytes of its blob reports. A merge-queue run whose Atomic e2e
 * task hits the Turbo cache uploads the same reports as the run that executed the tests.
 */
function fingerprint(buffers) {
  const hash = createHash('sha256');
  for (const buffer of buffers) {
    hash.update(buffer);
  }
  return hash.digest('hex');
}

/** Refuses an archive that holds a symbolic link, before anything is extracted. */
function assertNoLinks(zip) {
  const listing = execFileSync('unzip', ['-Z', zip], {
    encoding: 'utf8',
    env: untrustedEnv(),
    maxBuffer: 64 * 1024 * 1024,
  });
  if (/^l[rwxsStT-]{9}\s/m.test(listing)) {
    throw new Error(`${zip} holds a symbolic link`);
  }
}

/** Refuses a folder that holds anything but regular files and folders. */
function assertRegularTree(folder) {
  for (const entry of readdirSync(folder, {withFileTypes: true})) {
    const path = join(folder, entry.name);
    if (entry.isDirectory()) {
      assertRegularTree(path);
    } else if (!entry.isFile()) {
      throw new Error(`${path} is not a regular file`);
    }
  }
}

/**
 * Downloads the run's blob reports into `directory`, sorted by shard. Merge-queue code produced
 * the artifacts, so each one is unzipped into a new folder of its own outside `directory` and
 * refused if it holds a link: a link left by one artifact could otherwise redirect where the next
 * one is written. Only the regular `report*.zip` files reach `directory`.
 */
export async function downloadBlobReports(octokit, run, directory) {
  mkdirSync(directory, {recursive: true});
  const staging = `${directory}-artifacts`;
  mkdirSync(staging);
  for (const artifact of run.artifacts) {
    const {data} = await octokit.rest.actions.downloadArtifact({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      artifact_id: artifact.id,
      archive_format: 'zip',
    });
    const zip = join(staging, `${artifact.id}.zip`);
    writeFileSync(zip, Buffer.from(data), {flag: 'wx'});
    assertNoLinks(zip);
    const extracted = join(staging, String(artifact.id));
    mkdirSync(extracted);
    execFileSync('unzip', ['-qq', '-n', zip, '-d', extracted], {env: untrustedEnv()});
    assertRegularTree(extracted);
    for (const entry of readdirSync(extracted, {withFileTypes: true})) {
      if (entry.isFile() && /^report.*\.zip$/.test(entry.name)) {
        copyFileSync(
          join(extracted, entry.name),
          join(directory, entry.name),
          constants.COPYFILE_EXCL
        );
      }
    }
  }
  const blobs = readdirSync(directory)
    .filter((name) => /^report.*\.zip$/.test(name))
    .map((name) => {
      const path = join(directory, name);
      // A shard with a retry also stores traces and error contexts under resources/.
      const firstLine = execFileSync('unzip', ['-p', path, 'report.jsonl'], {
        env: untrustedEnv(),
        maxBuffer: 256 * 1024 * 1024,
      })
        .toString('utf8')
        .split('\n', 1)[0];
      return {path, shard: shardOf(firstLine)};
    })
    .sort((a, b) => a.shard.current - b.shard.current);
  return {
    blobs,
    complete: isComplete(blobs.map(({shard}) => shard)),
    total: blobs[0]?.shard.total ?? 0,
    fingerprint: fingerprint(blobs.map(({path}) => readFileSync(path))),
  };
}

/**
 * Replays a run's blob reports through @flakiness/playwright in the Atomic package, which writes
 * `report.json` to `outputDirectory`. Uploads stay off.
 */
export function replayThroughFlakiness(blobDirectory, outputDirectory, {atomicDirectory}) {
  execFileSync(
    'pnpm',
    [
      'exec',
      'playwright',
      'merge-reports',
      '--config',
      'playwright.config.ts',
      '--reporter',
      '@flakiness/playwright',
      blobDirectory,
    ],
    {
      cwd: atomicDirectory,
      env: untrustedEnv({
        FLAKINESS_OUTPUT_DIR: outputDirectory,
        FLAKINESS_DISABLE_UPLOAD: '1',
      }),
      stdio: ['ignore', 'ignore', 'inherit'],
    }
  );
  return join(outputDirectory, 'report.json');
}
