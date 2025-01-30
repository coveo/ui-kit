import {execSync} from 'child_process';
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
const devPublicDir = path.resolve(currentDir, '../dev');

const run = async () => {
  const headlessVersion = await getVersionFromPackageJson(headlessDir);
  const buenoVersion = await getVersionFromPackageJson(buenoDir);

  const directories = [
    `${devPublicDir}/headless/v${headlessVersion}`,
    `${devPublicDir}/bueno/v${buenoVersion}`,
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

  console.log(
    `Copying headless files to ${devPublicDir}/headless/v${headlessVersion}`
  );
  await copyFiles(
    path.join(headlessDir, 'dist/browser'),
    `${devPublicDir}/headless/v${headlessVersion}`
  );

  console.log(`Copying bueno files to ${devPublicDir}/bueno/v${buenoVersion}`);
  await copyFiles(
    path.join(buenoDir, 'dist/browser'),
    `${devPublicDir}/bueno/v${buenoVersion}`
  );

  console.log('Starting Vite server...');
  execSync('vite serve dev', {stdio: 'inherit'});
};

run().catch((err) => {
  console.error('An error occurred:', err);
  process.exit(1);
});
