import fs from 'node:fs/promises';
import path from 'node:path';
import colors from '../../ci/colors.mjs';

const currentDir = import.meta.dirname;
const repoRoot = path.resolve(currentDir, '../../..');
const devCdnDir = path.resolve(currentDir, '../dist');

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
  const manifestPath = path.resolve(repoRoot, 'cdn-manifest.json');
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf-8'));

  await fs.rm(devCdnDir, {recursive: true, force: true});

  for (const entry of manifest) {
    const sourcePath = path.resolve(repoRoot, entry.source);

    const packageName = entry.cdnDirPattern
      ? entry.name.replace('-storybook', '')
      : entry.name;
    const version = await getVersion(packageName);
    const levels = getVersionLevels(version);

    for (const level of Object.values(levels)) {
      let cdnPath;
      if (entry.cdnDirPattern) {
        cdnPath = entry.cdnDirPattern.replace('$VERSION', level);
      } else {
        cdnPath = `${entry.cdnDir}/v${level}`;
      }

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
