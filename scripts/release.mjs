import {execute} from './exec.mjs';

export async function bumpReleaseVersionAndPush() {
  console.info('Doing a release version bump.');
  await execute('npx', [
    '--no-install',
    'lerna',
    'version',
    '--conventional-commits',
    '--conventional-graduate',
    '--no-private',
    '--yes',
    '--exact',
  ]);
}
