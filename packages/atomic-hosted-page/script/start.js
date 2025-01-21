import {execSync} from 'child_process';
import fs from 'fs/promises';
import path from 'path';

const getCurrentDir = () => {
  const url = import.meta.url;
  const fileURL = new URL(url);
  return path.dirname(fileURL.pathname);
};

const getVersionFromPackageJson = async (packagePath) => {
  const packageJsonPath = path.join(packagePath, 'package.json');
  console.log(packagePath);
  try {
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
    return packageJson.version;
  } catch (err) {
    console.error(`Error reading ${packageJsonPath}: ${err.message}`);
    process.exit(1);
  }
};

const currentDir = getCurrentDir();
const headlessDir = path.resolve(currentDir, '../../headless');
const buenoDir = path.resolve(currentDir, '../../bueno');
const atomicHostedPageDir = path.resolve(
  currentDir,
  '../dist/atomic-hosted-page'
);
const devPublicDir = path.resolve(currentDir, '../dev/public');

const run = async () => {
  const headlessVersion = await getVersionFromPackageJson(headlessDir);
  const buenoVersion = await getVersionFromPackageJson(buenoDir);

  const directories = [
    `${devPublicDir}/headless/v${headlessVersion}`,
    `${devPublicDir}/bueno/v${buenoVersion}`,
    `${devPublicDir}/atomic-hosted-page/`,
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
  execSync(
    `cp -r ${headlessDir}/dist/browser/ ${devPublicDir}/headless/v${headlessVersion}`
  );

  console.log(`Copying bueno files to ${devPublicDir}/bueno/v${buenoVersion}`);
  execSync(
    `cp -r ${buenoDir}/dist/browser/ ${devPublicDir}/bueno/v${buenoVersion}`
  );

  console.log(
    `Copying atomic-hosted-page files to ${devPublicDir}/atomic-hosted-page/`
  );
  execSync(`cp -r ${atomicHostedPageDir}/ ${devPublicDir}/atomic-hosted-page/`);

  console.log('Starting Vite server...');
  execSync('vite serve dev', {stdio: 'inherit'});
};

run();
