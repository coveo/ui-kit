// Guard for `redeploy-cdn.yml`.
//
// A CDN version folder is derived from the `version` field of each package's
// package.json at the deployed commit, so replaying an arbitrary commit would
// happily create a folder for a version that was never published to npm. This
// script refuses that: every CDN package version in the current checkout must
// already exist on the npm registry.
//
// It also prints the resolved version -> CDN folder mapping to the job summary
// so whoever approves the `cdn-stable` gate can see what is about to be written.
//
// Environment:
//   COMMIT_SHA (required) the ui-kit commit being replayed, for the summary
//   CHANNELS   (required) comma-separated pointer channels
import {appendFileSync, readFileSync} from 'node:fs';
import {resolve} from 'node:path';

// ⚠️ Keep in sync with coveo-platform/ui-kit-cd
// `scripts/deploy/utils/cdn-packages.mjs`. Only the package directory is needed
// here; all CDN packages are published under the @coveo scope.
const CDN_PACKAGES = [
  'atomic',
  'atomic-hosted-page',
  'atomic-react',
  'bueno',
  'headless',
  'relay',
  'shopify',
];

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

function readVersion(pkg) {
  const path = resolve(process.cwd(), 'packages', pkg, 'package.json');
  const {version} = JSON.parse(readFileSync(path, 'utf-8'));
  if (typeof version !== 'string' || !/^\d+\.\d+\.\d+/.test(version)) {
    throw new Error(`Invalid version "${version}" in ${path}`);
  }
  return version;
}

async function isPublished(pkg, version) {
  const specifier = encodeURIComponent(`@coveo/${pkg}`);
  const response = await fetch(`https://registry.npmjs.org/${specifier}/${version}`);
  if (response.status === 200) {
    return true;
  }
  if (response.status === 404) {
    return false;
  }
  throw new Error(
    `Unexpected npm registry response for @coveo/${pkg}@${version}: ${response.status}`
  );
}

const commitSha = requireEnv('COMMIT_SHA');
const channels = requireEnv('CHANNELS');

const checked = await Promise.all(
  CDN_PACKAGES.map(async (pkg) => {
    const version = readVersion(pkg);
    return {pkg, version, published: await isPublished(pkg, version)};
  })
);

const rows = checked
  .map(
    ({pkg, version, published}) =>
      `| \`@coveo/${pkg}\` | \`${version}\` | \`/${pkg}/v${version}/\` | ${published ? 'yes' : '**NO**'} |`
  )
  .join('\n');

const summary = `## CDN redeploy plan

Commit: \`${commitSha}\`
Channels: \`${channels}\`

| Package | Version | Stable folder | On npm |
| --- | --- | --- | --- |
${rows}

Stable pointers are written to the major, minor and patch folders for each
version above. Approve the \`cdn-stable\` gate in \`coveo-platform/ui-kit-cd\` to
promote past preview.
`;

console.log(summary);
if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
}

// The private channel only writes `private/v<major>/`, a rolling pointer rather
// than a released version, so an unpublished version is harmless there. Only
// channels that can reach a released version folder are gated.
if (!channels.includes('preview') && !channels.includes('hotfix')) {
  console.log('Channels cannot reach a released version folder; skipping the npm check.');
  process.exit(0);
}

const missing = checked.filter(({published}) => !published);
if (missing.length > 0) {
  const list = missing.map(({pkg, version}) => `  @coveo/${pkg}@${version}`).join('\n');
  throw new Error(
    `Refusing to redeploy: these versions are not published on npm:\n${list}\n\n` +
      'A CDN version folder must never exist for a version npm does not have.\n' +
      'Pass a ref whose package.json versions match a published release, such as\n' +
      'a release tag (`@coveo/atomic@<version>`) or a branch cut from one.'
  );
}

console.log('All CDN package versions are published on npm.');
