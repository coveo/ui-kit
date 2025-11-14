#!/usr/bin/env node
import {spawn} from 'node:child_process';

/**
 * Run multiple turbo dev tasks in parallel.
 * Usage: node scripts/dev-parallel.mjs package1 package2 ...
 * Example: node scripts/dev-parallel.mjs @coveo/headless @coveo/atomic
 */

const packages = process.argv.slice(2);

if (packages.length === 0) {
  console.error('Error: Please specify at least one package to run dev on.');
  console.error(
    'Usage: node scripts/dev-parallel.mjs @coveo/package1 @coveo/package2 ...'
  );
  process.exit(1);
}

const reset = '\x1b[0m';
const colors = [
  '\x1b[36m', // cyan
  '\x1b[35m', // magenta
  '\x1b[33m', // yellow
  '\x1b[32m', // green
  '\x1b[34m', // blue
  '\x1b[31m', // red
];

function startDevTask(packageName, color) {
  const proc = spawn('npx', ['turbo', 'dev', `--filter=${packageName}`], {
    stdio: 'pipe',
    shell: process.platform === 'win32',
  });

  proc.stdout.on('data', (data) => {
    process.stdout.write(`${color}[${packageName}]${reset} ${data}`);
  });

  proc.stderr.on('data', (data) => {
    process.stderr.write(`${color}[${packageName}]${reset} ${data}`);
  });

  proc.on('exit', (code) => {
    if (code !== 0) {
      console.error(
        `${color}[${packageName}]${reset} exited with code ${code}`
      );
    }
  });

  return proc;
}

// Start all dev tasks
console.log(`Starting dev tasks for: ${packages.join(', ')}`);
const runningProcesses = packages.map((pkg, index) =>
  startDevTask(pkg, colors[index % colors.length])
);

// Handle termination signals
function cleanup() {
  runningProcesses.forEach((proc) => {
    proc.kill('SIGTERM');
  });
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
