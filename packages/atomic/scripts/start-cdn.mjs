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

const updateHtmlVersionsInDirectory = async (
  directoryPath,
  atomicVersion,
  headlessVersion,
  versionType,
  cdnType
) => {
  try {
    const files = await fs.readdir(directoryPath);
    const atomicRegex =
      /https?:\/\/(localhost:3000|static(?:dev|stg)?\.cloud\.coveo\.com)\/atomic\/v\d+(\.\d+)?(\.\d+)?/g;
    const headlessRegex =
      /https?:\/\/(localhost:3000|static(?:dev|stg)?\.cloud\.coveo\.com)\/headless\/v\d+(\.\d+)?(\.\d+)?/g;

    const cdnBaseUrl =
      cdnType === 'prod'
        ? 'https://static.cloud.coveo.com'
        : cdnType === 'dev'
          ? 'https://staticdev.cloud.coveo.com'
          : cdnType === 'staging'
            ? 'https://staticstg.cloud.coveo.com'
            : 'http://localhost:3000';

    const newAtomicVersion =
      versionType === 'major'
        ? `v${atomicVersion.split('.')[0]}`
        : versionType === 'minor'
          ? `v${atomicVersion.split('.').slice(0, 2).join('.')}`
          : versionType === 'patch'
            ? `v${atomicVersion}`
            : `${atomicVersion}`;

    const newHeadlessVersion =
      versionType === 'major'
        ? `v${headlessVersion.split('.')[0]}`
        : versionType === 'minor'
          ? `v${headlessVersion.split('.').slice(0, 2).join('.')}`
          : versionType === 'patch'
            ? `v${headlessVersion}`
            : `${headlessVersion}`;

    for (const file of files) {
      const filePath = path.join(directoryPath, file);
      const stats = await fs.stat(filePath);

      if (stats.isDirectory()) {
        await updateHtmlVersionsInDirectory(
          filePath,
          atomicVersion,
          headlessVersion,
          versionType,
          cdnType
        );
      } else if (
        file.endsWith('.html') ||
        file.endsWith('.js') ||
        file.endsWith('.mjs')
      ) {
        let content = await fs.readFile(filePath, 'utf-8');
        content = content.replace(
          atomicRegex,
          `${cdnBaseUrl}/atomic/${newAtomicVersion}`
        );
        content = content.replace(
          headlessRegex,
          `${cdnBaseUrl}/headless/${newHeadlessVersion}`
        );
        await fs.writeFile(filePath, content, 'utf-8');
        console.log(
          `Updated atomic version in ${filePath} to ${cdnBaseUrl}/atomic/${newAtomicVersion}`
        );
        console.log(
          `Updated headless version in ${filePath} to ${cdnBaseUrl}/headless/${newHeadlessVersion}`
        );
      }
    }
  } catch (err) {
    console.error(`Error updating files in ${directoryPath}: ${err.message}`);
    process.exit(1);
  }
};

const currentDir = import.meta.dirname;
const headlessDir = path.resolve(currentDir, '../../headless');
const buenoDir = path.resolve(currentDir, '../../bueno');
const atomicDir = path.resolve(currentDir, '../../atomic');
const devCdnDir = path.resolve(currentDir, '../dev-cdn/static');
const siteDir = path.resolve(currentDir, '../dev-cdn/site');

const run = async () => {
  const parseArgs = (args) => {
    const result = {};
    for (let i = 0; i < args.length; i++) {
      if (args[i].startsWith('--')) {
        const key = args[i].substring(2);
        const value =
          args[i + 1] && !args[i + 1].startsWith('--') ? args[++i] : true;
        result[key] = value;
      }
    }
    return result;
  };

  const args = parseArgs(process.argv.slice(2));
  const cdnType = args.env;
  const atomicCloudVersion = args.atomic;
  const headlessCloudVersion = args.headless;
  const versionType = args._ || args.atomic;

  if (
    !cdnType ||
    (cdnType === 'prod' && (!atomicCloudVersion || !headlessCloudVersion)) ||
    (cdnType === 'local' && !versionType) ||
    (cdnType !== 'prod' &&
      cdnType !== 'local' &&
      cdnType !== 'dev' &&
      cdnType !== 'staging')
  ) {
    console.error(
      'Usage: npx nx run atomic:web:cdn --args="--env <local|prod|dev|staging> --atomic <vX.Y.Z> [--headless <vX.Y.Z>]"'
    );
    process.exit(1);
  }

  if (cdnType === 'local') {
    if (!['major', 'minor', 'patch'].includes(versionType)) {
      console.error(
        'For local environment, --atomic and --headless must be one of: major, minor, or patch.'
      );
      process.exit(1);
    }
  } else if (cdnType === 'prod' || cdnType === 'staging' || cdnType === 'dev') {
    const versionRegex = /^v\d+(\.\d+)?(\.\d+)?$/;
    if (
      !versionRegex.test(atomicCloudVersion) ||
      !versionRegex.test(headlessCloudVersion)
    ) {
      console.error(
        'For cloud environment, --atomic and --headless must be in the format: vX.X.X, vX.X, or vX.'
      );
      process.exit(1);
    }
  }

  const headlessLocalVersion = await getVersionFromPackageJson(headlessDir);
  const buenoLocalVersion = await getVersionFromPackageJson(buenoDir);
  const atomicLocalVersion = await getVersionFromPackageJson(atomicDir);

  const directories = [
    `${devCdnDir}/headless/v${headlessLocalVersion}`,
    `${devCdnDir}/headless/v${headlessLocalVersion.split('.')[0]}`,
    `${devCdnDir}/headless/v${headlessLocalVersion.split('.').slice(0, 2).join('.')}`,
    `${devCdnDir}/bueno/v${buenoLocalVersion}`,
    `${devCdnDir}/bueno/v${buenoLocalVersion.split('.')[0]}`,
    `${devCdnDir}/bueno/v${buenoLocalVersion.split('.').slice(0, 2).join('.')}`,
    `${devCdnDir}/atomic/v${atomicLocalVersion}`,
    `${devCdnDir}/atomic/v${atomicLocalVersion.split('.')[0]}`,
    `${devCdnDir}/atomic/v${atomicLocalVersion.split('.').slice(0, 2).join('.')}`,
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

  if (cdnType === 'local') {
    await copyVersionedFiles(
      path.join(headlessDir, 'dist/browser'),
      `${devCdnDir}/headless`,
      headlessLocalVersion
    );

    await copyVersionedFiles(
      path.join(buenoDir, 'cdn'),
      `${devCdnDir}/bueno`,
      buenoLocalVersion
    );

    await copyVersionedFiles(
      path.join(atomicDir, 'dist/atomic'),
      `${devCdnDir}/atomic`,
      atomicLocalVersion
    );

    await updateHtmlVersionsInDirectory(
      siteDir,
      atomicLocalVersion,
      headlessLocalVersion,
      versionType,
      cdnType
    );
  } else {
    await updateHtmlVersionsInDirectory(
      siteDir,
      atomicCloudVersion,
      headlessCloudVersion,
      versionType,
      cdnType
    );
  }

  console.log(
    'Starting workspace server on port 3333 for ./dev-cdn/site directory...'
  );
  spawn('npx', ['ws', '--port', '3333', '-d', 'dev-cdn/site'], {
    stdio: 'inherit',
  });

  console.log(
    'Starting workspace server on port 3000 for ./dev-cdn/static directory...'
  );
  execSync('npx ws --port 3000 -d dev-cdn/static', {stdio: 'inherit'});
};

run().catch((err) => {
  console.error('An error occurred:', err);
  process.exit(1);
});
