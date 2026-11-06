// Reads the blob reports the Atomic shards upload (artifacts `atomic-blob-report-<n>`, kept
// 5 days) and replays each run through @flakiness/playwright, whose report its timings CLI reads.
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {REPO_NAME, REPO_OWNER} from '../common/constants.mjs';

const WORKFLOW = 'ci.yml';
const BLOB_ARTIFACT = /^atomic-blob-report-(\d+)$/;

function toRun(run) {
  return {id: run.id, url: run.html_url, createdAt: run.created_at, event: run.event};
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

export async function describeRun(octokit, runId) {
  const {data} = await octokit.rest.actions.getWorkflowRun({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    run_id: runId,
  });
  return {...toRun(data), artifacts: await blobArtifacts(octokit, runId)};
}

/**
 * The newest completed merge-queue runs that still have Atomic blob reports, newest first.
 * Pull-request runs are left out: they can carry tests that never reach main.
 */
export async function listRunsWithBlobReports(octokit) {
  const {data} = await octokit.rest.actions.listWorkflowRuns({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    workflow_id: WORKFLOW,
    event: 'merge_group',
    status: 'completed',
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
  if (method !== 'onBlobReportMetadata' || !params?.shard) {
    throw new Error('not a sharded Playwright blob report');
  }
  return params.shard;
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

/** Downloads the run's blob reports into `directory`, sorted by shard. */
export async function downloadBlobReports(octokit, run, directory) {
  mkdirSync(directory, {recursive: true});
  for (const artifact of run.artifacts) {
    const {data} = await octokit.rest.actions.downloadArtifact({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      artifact_id: artifact.id,
      archive_format: 'zip',
    });
    // merge-reports reads every zip in the directory, so the artifact's own zip must not stay.
    const zip = join(directory, `${artifact.name}.artifact.zip`);
    writeFileSync(zip, Buffer.from(data));
    execFileSync('unzip', ['-qq', '-o', zip, '-d', directory]);
    rmSync(zip);
  }
  const blobs = readdirSync(directory)
    .filter((name) => /^report.*\.zip$/.test(name))
    .map((name) => {
      const path = join(directory, name);
      // A shard with a retry also stores traces and error contexts under resources/.
      const firstLine = execFileSync('unzip', ['-p', path, 'report.jsonl'], {
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
      env: {
        ...process.env,
        FLAKINESS_OUTPUT_DIR: outputDirectory,
        FLAKINESS_DISABLE_UPLOAD: '1',
      },
      stdio: ['ignore', 'ignore', 'inherit'],
    }
  );
  return join(outputDirectory, 'report.json');
}
