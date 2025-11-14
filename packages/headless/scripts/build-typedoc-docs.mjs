#!/usr/bin/env node
import {spawn} from 'node:child_process';

/**
 * Build all typedoc JSON files in parallel.
 * This replaces the need for concurrently.
 */

const tasks = [
  'build:typedoc:search',
  'build:typedoc:commerce',
  'build:typedoc:case-assist',
  'build:typedoc:insight',
  'build:typedoc:recommendation',
  'build:typedoc:ssr',
  'build:typedoc:ssr-commerce',
];

function runTask(taskName) {
  return new Promise((resolve, reject) => {
    const proc = spawn('pnpm', ['run', taskName], {
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });

    proc.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Task ${taskName} failed with code ${code}`));
      }
    });

    proc.on('error', reject);
  });
}

// Run all tasks in parallel
Promise.all(tasks.map(runTask))
  .then(() => {
    console.log('All typedoc tasks completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error running typedoc tasks:', error);
    process.exit(1);
  });
