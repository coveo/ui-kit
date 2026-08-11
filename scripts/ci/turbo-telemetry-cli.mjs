#!/usr/bin/env node
/**
 * CLI wrapper: runs a turbo command with `--summarize`, then sanitizes the
 * generated run summary into a small, versioned telemetry artifact.
 *
 * USAGE (see .github/workflows/ci.yml "Run unit tests" step):
 *   node scripts/ci/turbo-telemetry-cli.mjs ci-telemetry-v1.json -- test --affected
 *
 * Everything after `--` is forwarded verbatim to `turbo run`. The wrapped
 * command's exit code is always preserved and returned by this process,
 * REGARDLESS of whether telemetry sanitization succeeds — a telemetry
 * failure must never make an otherwise-green CI job fail or mask a real
 * test failure with a different exit code.
 */

import {spawn} from 'node:child_process';
import {mkdirSync, readdirSync, readFileSync, statSync, writeFileSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';
import {sanitizeTurboSummary} from './turbo-telemetry.mjs';

const RUNS_DIR = resolve('.turbo/runs');

function parseArgs(argv) {
  const separatorIndex = argv.indexOf('--');
  if (separatorIndex === -1) {
    throw new Error('Usage: turbo-telemetry-cli.mjs <output-path> -- <turbo-run-args...>');
  }
  const outputPath = argv[0];
  if (!outputPath || separatorIndex !== 1) {
    throw new Error('Usage: turbo-telemetry-cli.mjs <output-path> -- <turbo-run-args...>');
  }
  return {outputPath, turboArgs: argv.slice(separatorIndex + 1)};
}

/** Resolves once the child process exits, never rejects — code may be null if killed by signal. */
function runTurbo(turboArgs) {
  return new Promise((resolveExit) => {
    const child = spawn('pnpm', ['exec', 'turbo', 'run', ...turboArgs, '--summarize'], {
      stdio: 'inherit',
    });
    child.on('exit', (code, signal) => {
      resolveExit(code ?? (signal ? 1 : 1));
    });
    child.on('error', () => resolveExit(1));
  });
}

/** Finds the most recently written summary file in .turbo/runs, or null if none exist. */
function findLatestSummary() {
  let entries;
  try {
    entries = readdirSync(RUNS_DIR).filter((name) => name.endsWith('.json'));
  } catch {
    return null;
  }
  if (entries.length === 0) return null;

  let latestPath = null;
  let latestMtime = -Infinity;
  for (const name of entries) {
    const path = join(RUNS_DIR, name);
    const mtime = statSync(path).mtimeMs;
    if (mtime > latestMtime) {
      latestMtime = mtime;
      latestPath = path;
    }
  }
  return latestPath;
}

async function main() {
  const {outputPath, turboArgs} = parseArgs(process.argv.slice(2));

  const exitCode = await runTurbo(turboArgs);

  // Best-effort telemetry — never allowed to change the exit code above.
  try {
    const summaryPath = findLatestSummary();
    if (!summaryPath) {
      console.warn(
        '[turbo-telemetry] No run summary found in .turbo/runs — skipping telemetry for this run.'
      );
    } else {
      const rawSummary = JSON.parse(readFileSync(summaryPath, 'utf8'));
      const sanitized = sanitizeTurboSummary(rawSummary);
      mkdirSync(dirname(resolve(outputPath)), {recursive: true});
      writeFileSync(resolve(outputPath), JSON.stringify(sanitized, null, 2));
      console.log(
        `[turbo-telemetry] Wrote sanitized telemetry to ${outputPath} ` +
          `(${sanitized.totalTasks} task(s), ${sanitized.cacheHits} cache hit(s))`
      );
    }
  } catch (error) {
    console.warn(
      `[turbo-telemetry] Failed to produce telemetry — continuing without it: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }

  process.exit(exitCode);
}

await main();
