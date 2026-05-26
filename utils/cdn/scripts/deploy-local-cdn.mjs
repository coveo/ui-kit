import fs from 'node:fs/promises';
import path from 'node:path';
import colors from '../../ci/colors.mjs';

const currentDir = import.meta.dirname;
const repoRoot = path.resolve(currentDir, '../../..');
const devCdnDir = path.resolve(currentDir, '../dist');

// ⚠️  WARNING: If a package's build output directory or CDN path changes,
// update this list AND the corresponding deployment configs in ui-kit-cd
// (.deployment.config/{commit,dev,prd}.json).
const packages = [
  {name: 'bueno', source: 'packages/bueno/cdn', cdnPath: 'bueno/v$VERSION'},
  {
    name: 'headless',
    source: 'packages/headless/cdn',
    cdnPath: 'headless/v$VERSION',
  },
  {name: 'atomic', source: 'packages/atomic/cdn', cdnPath: 'atomic/v$VERSION'},
  {
    name: 'atomic-storybook',
    source: 'packages/atomic/dist-storybook',
    cdnPath: 'atomic/v$VERSION/storybook',
  },
  {
    name: 'atomic-react',
    source: 'packages/atomic-react/dist',
    cdnPath: 'atomic-react/v$VERSION',
  },
  {
    name: 'atomic-hosted-page',
    source: 'packages/atomic-hosted-page/cdn',
    cdnPath: 'atomic-hosted-page/v$VERSION/atomic-hosted-page',
  },
  {
    name: 'shopify',
    source: 'packages/shopify/cdn',
    cdnPath: 'shopify/v$VERSION',
  },
];

const getVersion = async (packageName) => {
  const packageJsonPath = path.resolve(
    repoRoot,
    'packages',
    packageName,
    'package.json'
  );
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
  return packageJson.version;
};

const getVersionLevels = (version) => {
  const [major, minor] = version.split('.');
  return {
    major,
    minor: `${major}.${minor}`,
    patch: version,
  };
};

const copyFiles = async (source, destination) => {
  await fs.cp(source, destination, {recursive: true, force: true});
};

const main = async () => {
  await fs.rm(devCdnDir, {recursive: true, force: true});

  for (const entry of packages) {
    const sourcePath = path.resolve(repoRoot, entry.source);
    const packageName = entry.source.split('/')[1];
    const version = await getVersion(packageName);
    const levels = getVersionLevels(version);

    for (const level of Object.values(levels)) {
      const cdnPath = entry.cdnPath.replace('$VERSION', level);
      const targetPath = path.resolve(devCdnDir, 'proda/StaticCDN', cdnPath);

      await fs.mkdir(targetPath, {recursive: true});
      await copyFiles(sourcePath, targetPath);
    }
  }
};

main().catch((err) => {
  console.error(
    colors.red('An error occurred during local CDN deployment:'),
    err.message
  );
  process.exit(1);
});
