import {execSync, spawn} from 'child_process';
import fs from 'fs/promises';
import ncp from 'ncp';
import path from 'path';

const getVersionFromPackageJson = async (packagePath) => {
  const packageJsonPath = path.join(packagePath, 'package.json');
  try {
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
    return packageJson.version;
  } catch (err) {
    console.error(`Error reading ${packageJsonPath}: ${err.message}`);
    process.exit(1);
  }
};

const copyFiles = async (source, destination) => {
  return new Promise((resolve, reject) => {
    ncp(source, destination, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

const currentDir = import.meta.dirname;
const headlessDir = path.resolve(currentDir, '../../headless');
const buenoDir = path.resolve(currentDir, '../../bueno');
const atomicDir = path.resolve(currentDir, '../../atomic');
const devCdnDir = path.resolve(currentDir, '../dev-cdn/static');

const run = async () => {
  const headlessVersion = await getVersionFromPackageJson(headlessDir);
  const headlessVersionMajor = headlessVersion.split('.')[0];
  const headlessVersionMinor = headlessVersion.split('.').slice(0, 2).join('.');
  const buenoVersion = await getVersionFromPackageJson(buenoDir);
  const buenoVersionMajor = buenoVersion.split('.')[0];
  const buenoVersionMinor = buenoVersion.split('.').slice(0, 2).join('.');
  const atomicVersion = await getVersionFromPackageJson(atomicDir);
  const atomicVersionMajor = atomicVersion.split('.')[0];
  const atomicVersionMinor = atomicVersion.split('.').slice(0, 2).join('.');

  const directories = [
    `${devCdnDir}/headless/v${headlessVersion}`,
    `${devCdnDir}/headless/v${headlessVersionMajor}`,
    `${devCdnDir}/headless/v${headlessVersionMinor}`,
    `${devCdnDir}/bueno/v${buenoVersion}`,
    `${devCdnDir}/bueno/v${buenoVersionMajor}`,
    `${devCdnDir}/bueno/v${buenoVersionMinor}`,
    `${devCdnDir}/atomic/v${atomicVersion}`,
    `${devCdnDir}/atomic/v${atomicVersionMajor}`,
    `${devCdnDir}/atomic/v${atomicVersionMinor}`,
  ];

  for (const dir of directories) {
    if (
      await fs
        .access(dir)
        .then(() => true)
        .catch(() => false)
    ) {
      console.log(`Deleting existing directory: ${dir}`);
      await fs.rm(dir, {recursive: true, force: true});
    }
  }

  for (const dir of directories) {
    console.log(`Creating directory: ${dir}`);
    await fs.mkdir(dir, {recursive: true});
  }

  const copyVersionedFiles = async (sourceDir, targetBaseDir, version) => {
    const [major, minor] = version.split('.');
    const versionPaths = [
      `${targetBaseDir}/v${version}`,
      `${targetBaseDir}/v${major}`,
      `${targetBaseDir}/v${major}.${minor}`,
    ];

    for (const targetDir of versionPaths) {
      console.log(`Copying files to ${targetDir}`);
      await copyFiles(sourceDir, targetDir);
    }
  };

  await copyVersionedFiles(
    path.join(headlessDir, 'dist/browser'),
    `${devCdnDir}/headless`,
    headlessVersion
  );

  await copyVersionedFiles(
    path.join(buenoDir, 'cdn'),
    `${devCdnDir}/bueno`,
    buenoVersion
  );

  await copyVersionedFiles(
    path.join(atomicDir, 'dist/atomic'),
    `${devCdnDir}/atomic`,
    atomicVersion
  );

  console.log('Starting workspace server on port 3333 for ./dev directory...');
  spawn('npx', ['ws', '--port', '3333', '-d', 'dev-cdn/site'], {
    stdio: 'inherit',
  });

  console.log('Starting workspace server...');
  execSync('npx ws --port 3000 -d dev-cdn/static', {stdio: 'inherit'});
};

run().catch((err) => {
  console.error('An error occurred:', err);
  process.exit(1);
});
