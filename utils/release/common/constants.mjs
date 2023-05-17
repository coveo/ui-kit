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
export const RELEASER_AUTH_SECRETS = {
  appId: process.env.RELEASER_APP_ID,
  privateKey: process.env.RELEASER_PRIVATE_KEY,
  clientId: process.env.RELEASER_CLIENT_ID,
  clientSecret: process.env.RELEASER_CLIENT_SECRET,
  installationId: process.env.RELEASER_INSTALLATION_ID,
};
