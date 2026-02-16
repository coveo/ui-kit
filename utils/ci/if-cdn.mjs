#!/usr/bin/env node
import {execSync} from 'node:child_process';

if (!process.env.INIT_CWD) {
  throw new Error('Should be called using pnpm run');
}
process.chdir(process.env.INIT_CWD);

if (process.env.DEPLOYMENT_ENVIRONMENT === 'CDN' && process.argv.length === 3) {
  execSync(process.argv[process.argv.length - 1], {stdio: 'inherit'});
}
