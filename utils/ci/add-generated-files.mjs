#!/usr/bin/env node
import {Octokit} from 'octokit';
import {commitChanges, setupGit} from './common/git.mjs';

if (!process.env.INIT_CWD) {
  throw new Error('Should be called using pnpm run');
}
process.chdir(process.env.INIT_CWD);

// Commit, tag and push
const octokit = new Octokit({
  auth: process.env.GITHUB_INSTALLATION_TOKEN,
});

// Setup Git with the bot user
await setupGit();

// Compile git commit message
const commitMessage = 'Add generated files';

// Craft the commit & updates the HEAD of the current branch
await commitChanges(commitMessage, octokit);
