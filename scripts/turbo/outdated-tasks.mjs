#!/usr/bin/env node
import {execFile as execFileCallback} from 'node:child_process';
import {promisify} from 'node:util';

const turboArgs = [
  'exec',
  'turbo',
  'build',
  '--affected',
  '--dry-run=json',
  '--no-update-notifier',
];
const packageManager = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
const execFile = promisify(execFileCallback);

async function runTurbo() {
  const {stdout} = await execFile(packageManager, turboArgs, {
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
    shell: process.platform === 'win32',
  });

  return stdout;
}

function getOutdatedTasks(output) {
  const {tasks = []} = JSON.parse(output);

  return tasks
    .filter(
      ({taskId, command}) =>
        command !== '<NONEXISTENT>' &&
        (taskId.startsWith('@coveo/') || taskId.startsWith('@samples/'))
    )
    .map(({taskId}) => taskId);
}

try {
  const output = await runTurbo();
  const taskIds = getOutdatedTasks(output);

  if (taskIds.length > 0) {
    process.stdout.write(`${taskIds.join('\n')}\n`);
  }
} catch (error) {
  const stderr =
    error instanceof Error && 'stderr' in error && typeof error.stderr === 'string'
      ? error.stderr.trim()
      : '';
  console.error(stderr || (error instanceof Error ? error.message : error));
  process.exitCode = 1;
}
