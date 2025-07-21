import {execSync} from 'node:child_process';
import {context} from '@actions/github';

export function getBaseHeadSHAs() {
  switch (context.eventName) {
    case 'pull_request':
      return {
        base: context.payload.pull_request.base.sha,
        head: context.payload.pull_request.head.sha,
      };
    case 'merge_group':
      return {
        base: context.payload.merge_group.base_sha,
        head: context.payload.merge_group.head_sha,
      };
  }
}

export function getChangedFiles(from, to) {
  return execSync(`git diff --name-only ${from}..${to}`, {
    stdio: 'pipe',
    encoding: 'utf-8',
  });
}
