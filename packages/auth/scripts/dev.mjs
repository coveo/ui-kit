#!/usr/bin/env node
import {spawn} from 'node:child_process';

/**
 * Dev script for auth package that runs both type definitions and bundle builds in watch mode.
 * This replaces the need for concurrently by spawning both processes.
 */

const processes = [
  {
    name: 'build:definitions',
    command: 'pnpm',
    args: ['run', 'build:definitions', '-w'],
    color: '\x1b[36m', // cyan
  },
  {
    name: 'build:bundles',
    command: 'pnpm',
    args: ['run', 'build:bundles', 'dev'],
    color: '\x1b[35m', // magenta
  },
];

const reset = '\x1b[0m';

function startProcess({name, command, args, color}) {
  const proc = spawn(command, args, {
    stdio: 'pipe',
    shell: process.platform === 'win32',
  });

  proc.stdout.on('data', (data) => {
    process.stdout.write(`${color}[${name}]${reset} ${data}`);
  });

  proc.stderr.on('data', (data) => {
    process.stderr.write(`${color}[${name}]${reset} ${data}`);
  });

  proc.on('exit', (code) => {
    if (code !== 0) {
      console.error(`${color}[${name}]${reset} exited with code ${code}`);
      process.exit(code);
    }
  });

  return proc;
}

// Start all processes
const runningProcesses = processes.map(startProcess);

// Handle termination signals
function cleanup() {
  runningProcesses.forEach((proc) => {
    proc.kill('SIGTERM');
  });
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
