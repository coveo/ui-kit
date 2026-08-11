#!/usr/bin/env node
import {execFile as execFileCallback, spawn} from 'node:child_process';
import {promisify} from 'node:util';

const packageManager = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
const execFile = promisify(execFileCallback);
const turboArgs = ['exec', 'turbo', 'query', 'affected', '--packages', '--no-update-notifier'];
const knipArgs = ['exec', 'knip', '--exclude', 'catalog'];

async function getAffectedWorkspaces() {
  const {stdout} = await execFile(packageManager, turboArgs, {
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
    shell: process.platform === 'win32',
  });
  const result = JSON.parse(stdout);
  const items = result?.data?.affectedPackages?.items;

  if (!Array.isArray(items)) {
    throw new Error('Turbo returned an invalid affected-packages response.');
  }

  return [
    ...new Set(
      items.map(({name}) => {
        if (typeof name !== 'string') {
          throw new Error('Turbo returned an affected package without a name.');
        }
        return name === '//' ? '.' : name;
      })
    ),
  ].sort();
}

function runKnip(workspaces) {
  const workspaceArgs = workspaces.flatMap((workspace) => ['--workspace', workspace]);
  const child = spawn(packageManager, [...knipArgs, ...workspaceArgs], {
    shell: process.platform === 'win32',
    stdio: 'inherit',
  });

  return new Promise((resolve, reject) => {
    child.on('error', reject);
    child.on('close', (code, signal) => {
      if (signal) {
        reject(new Error(`Knip terminated by signal ${signal}.`));
        return;
      }
      resolve(code ?? 1);
    });
  });
}

try {
  const workspaces = await getAffectedWorkspaces();

  if (workspaces.length === 0) {
    console.info('No affected workspaces found. Skipping Knip.');
    process.exitCode = 0;
  } else {
    console.info(`Running Knip for affected workspaces: ${workspaces.join(', ')}`);
    process.exitCode = await runKnip(workspaces);
  }
} catch (error) {
  const stderr =
    error instanceof Error && 'stderr' in error && typeof error.stderr === 'string'
      ? error.stderr.trim()
      : '';
  console.error(stderr || (error instanceof Error ? error.message : error));
  process.exitCode = 1;
}
