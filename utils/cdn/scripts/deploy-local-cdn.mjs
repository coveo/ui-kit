import fs from 'node:fs/promises';
import path from 'node:path';
import chalk from 'chalk';
import ncp from 'ncp';

const currentDir = import.meta.dirname;

const preprocessConfig = async (configContent) => {
  const versionPlaceholderRegex =
    /\$\[([A-Z_]+?)_(MAJOR|MINOR|PATCH)_VERSION\]/g;

  const processedPlaceholderKeys = new Set();

  let match;
  versionPlaceholderRegex.lastIndex = 0;
  // biome-ignore lint/suspicious/noAssignInExpressions: <>
  while ((match = versionPlaceholderRegex.exec(configContent)) !== null) {
    const placeholderKey = match[0].substring(2, match[0].length - 1);

    if (processedPlaceholderKeys.has(placeholderKey)) {
      continue;
    }
    processedPlaceholderKeys.add(placeholderKey);
  }

  return configContent.replace(/\$\[([A-Z_]+)\]/g, '');
};

const deploymentConfigPath = path.resolve(
  currentDir,
  '../../../.deployment.config/prd.json'
);
const rawConfigContent = await fs.readFile(deploymentConfigPath, 'utf-8');
const processedConfigContent = await preprocessConfig(rawConfigContent);
const deploymentConfig = JSON.parse(processedConfigContent);

const devCdnDir = path.resolve(currentDir, `../dist`);

const copyFiles = async (source, destination) => {
  return new Promise((resolve, reject) => {
    ncp(source, destination, (err) => {
      if (err) {
        reject(
          new Error(
            `NCP error copying from ${source} to ${destination}: ${err ? err.map((e) => e.message).join(', ') : 'unknown error'}`
          )
        );
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
    throw new Error(`Failed to create directory ${directory}: ${err.message}`);
  }
};

const copyDagPhaseFiles = async () => {
  for (const phase of deploymentConfig.dag_phases) {
    if (phase.s3?.source && phase.s3.directory) {
      const sourcePath = path.resolve(
        currentDir,
        `../../../${phase.s3.source}`
      );
      const targetPath = path.resolve(devCdnDir, phase.s3.directory);

      try {
        await ensureDirectoryExists(targetPath);
        await copyFiles(sourcePath, targetPath);
      } catch (err) {
        throw new Error(
          `Failed to process phase ${phase.id} (source: ${sourcePath}, target: ${targetPath}): ${err.message}`
        );
      }
    }
  }
};

const main = async () => {
  await fs.rm(devCdnDir, {recursive: true, force: true});
  await ensureDirectoryExists(devCdnDir);

  await copyDagPhaseFiles();
};

main().catch((err) => {
  console.error(
    chalk.red('An error occurred during local CDN deployment:'),
    err.message
  );
  process.exit(1);
});
