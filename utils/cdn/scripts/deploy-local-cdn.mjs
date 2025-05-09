import fs from 'fs/promises';
import ncp from 'ncp';
import path from 'path';
import chalk from 'chalk';

const currentDir = import.meta.dirname;
const getVersionFromPackageJson = async (packageName, versionType) => {
  const packageJsonPath = path.resolve(
    currentDir,
    `../../../packages/${packageName}/package.json`
  );
  console.log(chalk.blue(`Reading version from ${packageJsonPath}`));
  try {
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
    const version = packageJson.version;
    const [major, minor, patch] = version.split('.');
    return (
      {
        major: major,
        minor: `${major}.${minor}`,
        patch: version,
      }[versionType] || version
    );
  } catch (err) {
    console.error(chalk.red(`Error reading ${packageJsonPath}: ${err.message}`));
    process.exit(1);
  }
};

const preprocessConfig = async (configContent) => {
  const versionPlaceholders = {
    IS_NIGHTLY: 'false',
    IS_NOT_NIGHTLY: 'true',
    BUENO_PATCH_VERSION: await getVersionFromPackageJson('bueno', 'patch'),
    BUENO_MINOR_VERSION: await getVersionFromPackageJson('bueno', 'minor'),
    BUENO_MAJOR_VERSION: await getVersionFromPackageJson('bueno', 'major'),
    HEADLESS_PATCH_VERSION: await getVersionFromPackageJson(
      'headless',
      'patch'
    ),
    HEADLESS_MINOR_VERSION: await getVersionFromPackageJson(
      'headless',
      'minor'
    ),
    HEADLESS_MAJOR_VERSION: await getVersionFromPackageJson(
      'headless',
      'major'
    ),
    ATOMIC_PATCH_VERSION: await getVersionFromPackageJson('atomic', 'patch'),
    ATOMIC_MINOR_VERSION: await getVersionFromPackageJson('atomic', 'minor'),
    ATOMIC_MAJOR_VERSION: await getVersionFromPackageJson('atomic', 'major'),
    SHOPIFY_MAJOR_VERSION: await getVersionFromPackageJson('shopify', 'major'),
  };

  return configContent.replace(/\$\[([A-Z_]+)\]/g, (_, key) => {
    return versionPlaceholders[key] || '';
  });
};

const deploymentConfigPath = path.resolve(
  currentDir,
  '../../../.deployment.config.json'
);
console.log(chalk.blue(`Reading config from ${deploymentConfigPath}`));
const rawConfigContent = await fs.readFile(deploymentConfigPath, 'utf-8');
const processedConfigContent = await preprocessConfig(rawConfigContent);
const deploymentConfig = JSON.parse(processedConfigContent);

const devCdnDir = path.resolve(currentDir, `../dist`);

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

const ensureDirectoryExists = async (directory) => {
  try {
    await fs.mkdir(directory, {recursive: true});
  } catch (err) {
    console.error(`Failed to create directory ${directory}:`, err);
    throw err;
  }
};

const copyDagPhaseFiles = async () => {
  for (const phase of deploymentConfig.dag_phases) {
    if (phase.s3 && phase.s3.source && phase.s3.directory) {
      const sourcePath = path.resolve(
        currentDir,
        `../../../${phase.s3.source}`
      );
      const targetPath = path.resolve(devCdnDir, phase.s3.directory);

      console.log(
        chalk.blue(`Copying files from ${sourcePath} to ${targetPath}`)
      );

      try {
        await ensureDirectoryExists(targetPath);
        await copyFiles(sourcePath, targetPath);
      } catch (err) {
        console.error(
          chalk.red(`Failed to copy files for phase ${phase.id}:`),
          err
        );
      }
    }
  }
};

const main = async () => {

  await copyDagPhaseFiles();

};

main().catch((err) => {
  console.error(chalk.red('An error occurred:'), err);
  process.exit(1);
});
