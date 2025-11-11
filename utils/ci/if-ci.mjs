#!/usr/bin/env node
import {execSync} from 'node:child_process';

if (!process.env.INIT_CWD) {
  throw new Error('Should be called using pnpm run');
}
process.chdir(process.env.INIT_CWD);

if (process.argv.length === 3) {
  execSync(`pnpm ${process.argv[2]}:${process.env.CI ? 'ci' : 'no-ci'}`, {
    stdio: 'inherit',
  });
}
