import {execSync} from 'child_process';
import fs from 'fs/promises';
import path from 'path';

const getCurrentDir = () => {
  const url = import.meta.url;
  const fileURL = new URL(url);
  return path.dirname(fileURL.pathname);
};

const verifyFilesExist = async (files) => {
  for (const file of files) {
    try {
      await fs.access(file);
      console.log(`Verified: ${file} exists`);
    } catch {
      console.error(`Error: ${file} is missing!`);
      process.exit(1);
    }
  }
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
const devPublicDir = path.resolve(currentDir, '../dev');

/**
 * All of this code below is there so simulate the CDN when DEPLOYMENT_ENVIRONMENT=CDN is set during the build
 * of the packages. Without DEPLOYMENT_ENVIRONMENT=CDN, for cases where we build for npm, only the
 * "Starting Vite server..."" is important.
 */
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
    `cp -r ${headlessDir}/dist/browser/. ${devPublicDir}/headless/v${headlessVersion}`
  );

  console.log(`Copying bueno files to ${devPublicDir}/bueno/v${buenoVersion}`);
  execSync(
    `cp -r ${buenoDir}/dist/browser/. ${devPublicDir}/bueno/v${buenoVersion}`
  );

  console.log(
    `Copying atomic-hosted-page files to ${devPublicDir}/atomic-hosted-page/`
  );
  execSync(
    `cp -r ${atomicHostedPageDir}/. ${devPublicDir}/atomic-hosted-page/`
  );

  const filesToVerify = [
    `${devPublicDir}/headless/v${headlessVersion}/headless.esm.js`,
    `${devPublicDir}/bueno/v${buenoVersion}/bueno.esm.js`,
    `${devPublicDir}/atomic-hosted-page/atomic-hosted-page.esm.js`,
  ];

  console.log('Verifying copied files...');
  await verifyFilesExist(filesToVerify);

  console.log('Directory structure in "dev":');
  try {
    execSync('tree dev', {stdio: 'inherit'});
  } catch {
    console.log(
      '"tree" command is not available. Showing a recursive list instead:'
    );
    execSync('ls -R dev', {stdio: 'inherit'});
  }

  console.log('IS IT CDN : ', process.env.DEPLOYMENT_ENVIRONMENT);
  console.log('Starting Vite server...');
  execSync('ws --directory dev/', {stdio: 'inherit'});
};

run();

/**
 * PROBLEM MUST BE HERE, STUFF IS NOT COPYING CORRECTLY. ADD CHECKS THAT VERIFIES THE FILES ARE THERE BEFORE WEB SERVING IT
 */
