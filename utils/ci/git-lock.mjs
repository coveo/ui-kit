#!/usr/bin/env node
import {getSHA1fromRef, gitPull} from '@coveo/semantic-monorepo-tools';
import {dedent} from 'ts-dedent';
import {REPO_MAIN_BRANCH} from './common/constants.mjs';
import {
  limitWriteAccessToBot,
  removeWriteAccessRestrictions,
} from './lock-main.mjs';

if (!process.env.INIT_CWD) {
  throw new Error('Should be called using pnpm run');
}
process.chdir(process.env.INIT_CWD);

const isPrerelease = process.env.IS_PRERELEASE === 'true';

const ensureUpToDateBranch = async () => {
  // Lock-out main
  await limitWriteAccessToBot();

  // Verify main has not changed
  const local = await getSHA1fromRef(REPO_MAIN_BRANCH);
  await gitPull();
  const remote = await getSHA1fromRef(REPO_MAIN_BRANCH);
  if (local !== remote) {
    await removeWriteAccessRestrictions();
    throw new Error(dedent`
        Main branch changed before lockout.
        pre-lock:${local}
        post-lock:${remote}
      `);
  }
};

if (!isPrerelease) {
  await ensureUpToDateBranch();
}
