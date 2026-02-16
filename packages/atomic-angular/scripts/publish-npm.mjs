import {readFileSync, writeFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const scriptsDir = dirname(fileURLToPath(import.meta.url));
const packageDir = resolve(scriptsDir, '..');
const packagesDir = resolve(packageDir, '..');
const distDir = resolve(packageDir, 'projects/atomic-angular/dist');
const distPackageJsonPath = resolve(distDir, 'package.json');

const resolveWorkspaceVersions = () => {
  const distPackageJson = JSON.parse(
    readFileSync(distPackageJsonPath, {encoding: 'utf-8'})
  );
  const entries = [
    {
      section: 'dependencies',
      name: '@coveo/atomic',
      source: resolve(packagesDir, 'atomic/package.json'),
    },
    {
      section: 'peerDependencies',
      name: '@coveo/headless',
      source: resolve(packagesDir, 'headless/package.json'),
    },
  ];
  for (const {section, name, source} of entries) {
    const sectionData = distPackageJson[section];
    if (!sectionData) {
      continue;
    }
    const currentValue = sectionData[name];
    if (
      typeof currentValue !== 'string' ||
      !currentValue.startsWith('workspace:')
    ) {
      continue;
    }
    const {version} = JSON.parse(readFileSync(source, {encoding: 'utf-8'}));
    if (!version) {
      throw new Error(`Missing version in ${source}`);
    }
    sectionData[name] = version;
  }
  writeFileSync(
    distPackageJsonPath,
    `${JSON.stringify(distPackageJson, null, 2)}\n`
  );
};

resolveWorkspaceVersions();
process.env.INIT_CWD = distDir;
await import('@coveo/ci/npm-publish-package.mjs');
