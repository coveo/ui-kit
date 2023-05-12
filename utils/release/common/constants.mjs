import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

export const REPO_HOST = 'https://github.com';
export const REPO_OWNER = 'coveo';
export const REPO_NAME = 'ui-kit';
export const REPO_MAIN_BRANCH = 'master';
export const REPO_FS_ROOT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  '..'
);
