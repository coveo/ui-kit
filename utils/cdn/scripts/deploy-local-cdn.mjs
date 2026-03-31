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

const getPackageDir = (source) => {
  const parts = source.split('/');
  return parts.slice(0, 2).join('/');
};

const main = async () => {
  const manifestPath = path.resolve(repoRoot, 'cdn-manifest.jsonc');
  const manifestRaw = await fs.readFile(manifestPath, 'utf-8');
  const manifest = JSON.parse(manifestRaw.replace(/\/\/.*$/gm, ''));

  await fs.rm(devCdnDir, {recursive: true, force: true});

  for (const entry of manifest) {
    const sourcePath = path.resolve(repoRoot, entry.source);
    const packageDir = getPackageDir(entry.source);
    const version = await getVersion(path.basename(packageDir));
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
