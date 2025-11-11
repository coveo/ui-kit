import {spawn} from 'node:child_process';
import {readdirSync, readFileSync, statSync, writeFileSync} from 'node:fs';
import {findPackageJSON} from 'node:module';
import path from 'node:path';
import colors from '../../../utils/ci/colors.mjs';

const currentDir = import.meta.dirname;
const siteDir = path.resolve(currentDir, '../dev');

const getVersionFromPackageJson = async (packageName, versionType) => {
  const packageJsonPath = findPackageJSON(
    `@coveo/${packageName}`,
    import.meta.url
  );
  console.log(`Reading version from ${packageJsonPath}`);
  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    const version = packageJson.version;
    const [major, minor] = version.split('.');
    return (
      {
        major: major,
        minor: `${major}.${minor}`,
        patch: version,
      }[versionType] || version
    );
  } catch (err) {
    console.error(`Error reading ${packageJsonPath}: ${err.message}`);
    process.exit(1);
  }
};

const updateHtmlVersionsInDirectory = (
  directoryPath,
  atomicVersion,
  headlessVersion,
  versionType,
  cdnType
) => {
  try {
    const files = readdirSync(directoryPath).toSorted();
    const atomicRegex =
      /https?:\/\/(localhost:3000|static(?:dev|stg)?\.cloud\.coveo\.com)\/atomic\/v\d+(\.\d+)?(\.\d+)?/g;
    const headlessRegex =
      /https?:\/\/(localhost:3000|static(?:dev|stg)?\.cloud\.coveo\.com)\/headless\/v\d+(\.\d+)?(\.\d+)?/g;
    const atomicAssetRegex =
      /(["'`(])@coveo\/atomic\/assets\/(.*?)(["'`)])|@coveo\/atomic\/assets\/(\S+)/g;

    const cdnBaseUrl =
      {
        prod: 'https://static.cloud.coveo.com',
        dev: 'https://staticdev.cloud.coveo.com',
        staging: 'https://staticstg.cloud.coveo.com',
      }[cdnType] || 'http://localhost:3000';

    const getVersion = (version, type) => {
      const [major, minor] = version.split('.');
      return (
        {
          major: `v${major}`,
          minor: `v${major}.${minor}`,
          patch: `v${version}`,
        }[type] || version
      );
    };

    const newAtomicVersion = getVersion(atomicVersion, versionType);
    const newHeadlessVersion = getVersion(headlessVersion, versionType);

    for (const file of files) {
      const filePath = path.join(directoryPath, file);
      const stats = statSync(filePath);

      if (stats.isDirectory()) {
        updateHtmlVersionsInDirectory(
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
        let content = readFileSync(filePath, 'utf-8');
        content = content.replace(
          atomicRegex,
          `${cdnBaseUrl}/atomic/${newAtomicVersion}`
        );
        content = content.replace(
          headlessRegex,
          `${cdnBaseUrl}/headless/${newHeadlessVersion}`
        );
        content = content.replace(atomicAssetRegex, (match, p1, p2, p3, p4) => {
          const assetPath = p2 || p4;
          if (!assetPath) {
            return match;
          }
          const prefix = p1 || '';
          const suffix = p3 || '';
          return `${prefix}${cdnBaseUrl}/atomic/${newAtomicVersion}/assets/${assetPath}${suffix}`;
        });
        writeFileSync(filePath, content, 'utf-8');
        console.log(
          `Updated atomic version in ${colors.green(filePath)} to ${colors.blue(`${cdnBaseUrl}/atomic/${newAtomicVersion}`)}`
        );
        console.log(
          `Updated headless version in ${colors.green(filePath)} to ${colors.blue(`${cdnBaseUrl}/headless/${newHeadlessVersion}`)}`
        );
        console.log(
          `Updated @coveo/atomic assets in ${colors.green(filePath)} to ${colors.blue(`${cdnBaseUrl}/atomic/${newAtomicVersion}/assets/`)}`
        );
      }
    }
  } catch (err) {
    console.error(
      `Error updating files in ${colors.yellow(directoryPath)}: ${colors.red(err.message)}`
    );
    process.exit(1);
  }
};

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

const validateArgs = (
  cdnType,
  atomicCloudVersion,
  headlessCloudVersion,
  versionType
) => {
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
      colors.red(
        'Usage: pnpm --filter @coveo/atomic web:cdn -- --env <local|prod|dev|staging> --atomic <vX.Y.Z> [--headless <vX.Y.Z>]'
      )
    );
    process.exit(1);
  }

  if (cdnType === 'local') {
    if (!['major', 'minor', 'patch'].includes(versionType)) {
      console.error(
        colors.red(
          'For local environment, --atomic and --headless must be one of: major, minor, or patch.'
        )
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
        colors.red(
          'For cloud environment, --atomic and --headless must be in the format: vX.X.X, vX.X, or vX.'
        )
      );
      process.exit(1);
    }
  }
};

const waitForServer = async (url) => {
  while (true) {
    try {
      await fetch(url);
      return true;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
};

try {
  const args = parseArgs(process.argv.slice(2));
  const cdnType = args.env;
  const atomicCloudVersion = args.atomic;
  const headlessCloudVersion = args.headless;
  const versionType = args._ || args.atomic;

  validateArgs(cdnType, atomicCloudVersion, headlessCloudVersion, versionType);

  const headlessLocalVersion = await getVersionFromPackageJson(
    'headless',
    versionType
  );
  const atomicLocalVersion = await getVersionFromPackageJson(
    'atomic',
    versionType
  );

  if (cdnType === 'local') {
    await updateHtmlVersionsInDirectory(
      siteDir,
      atomicLocalVersion,
      headlessLocalVersion,
      versionType,
      cdnType
    );
    spawn('npx', ['turbo', 'serve', '--filter=@coveo/cdn'], {
      stdio: 'inherit',
    });

    console.log(colors.cyan('Waiting for server on port 3000 to be ready...'));
    await waitForServer('http://localhost:3000');
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
    colors.cyan('Starting workspace server on port 3333 for ./dev directory...')
  );
  spawn('npx', ['ws', '--port', '3333', '-d', 'dev', '--open'], {
    stdio: 'inherit',
  });
} catch (err) {
  console.error(colors.red('An error occurred:'), err);
  process.exit(1);
}
