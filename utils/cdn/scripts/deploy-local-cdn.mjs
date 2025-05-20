import {readFileSync, mkdirSync, rmSync} from 'fs';
import ncp from 'ncp';
import path from 'path';
import chalk from 'chalk';

const currentDir = import.meta.dirname;
const getVersionFromPackageJson = (packageName, versionType) => {
  const packageJsonPath = path.resolve(
    currentDir,
    `../../../packages/${packageName}/package.json`
  );
  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
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
    throw new Error(`Error reading or parsing ${packageJsonPath}: ${err.message}`);
  }
};

const preprocessConfig = (configContent) => {
  const versionPlaceholders = {
    IS_NIGHTLY: 'false',
    IS_NOT_NIGHTLY: 'true',
  };

  const versionPlaceholderRegex = /\$\[([A-Z_]+?)_(MAJOR|MINOR|PATCH)_VERSION\]/g;
  
  const processedPlaceholderKeys = new Set();

  let match;
  versionPlaceholderRegex.lastIndex = 0;
  while ((match = versionPlaceholderRegex.exec(configContent)) !== null) {
    const placeholderKey = match[0].substring(2, match[0].length - 1); 
    
    if (processedPlaceholderKeys.has(placeholderKey)) {
      continue;
    }
    processedPlaceholderKeys.add(placeholderKey);

    const packageIdentifier = match[1]; 
    const versionTypeIdentifier = match[2]; 

    const packageName = packageIdentifier.replace(/_/g, '-').toLowerCase();
    const versionType = versionTypeIdentifier.toLowerCase();
    
    const version = getVersionFromPackageJson(packageName, versionType);
    versionPlaceholders[placeholderKey] = version;
  }

  return configContent.replace(/\$\[([A-Z_]+)\]/g, (_, key) => {
    if (versionPlaceholders.hasOwnProperty(key)) {
      return versionPlaceholders[key];
    }
    return ''; 
  });
};

const deploymentConfigPath = path.resolve(
  currentDir,
  '../../../.deployment.config.json'
);
const rawConfigContent = readFileSync(deploymentConfigPath, 'utf-8');
const processedConfigContent = preprocessConfig(rawConfigContent);
const deploymentConfig = JSON.parse(processedConfigContent);

const devCdnDir = path.resolve(currentDir, `../dist`);

const copyFiles = (source, destination) => {
  return new Promise((resolve, reject) => {
    ncp(source, destination, (err) => {
      if (err) {
        reject(new Error(`NCP error copying from ${source} to ${destination}: ${err ? err.map(e => e.message).join(', ') : 'unknown error'}`));
      } else {
        resolve();
      }
    });
  });
};

const ensureDirectoryExists = (directory) => {
  try {
    mkdirSync(directory, {recursive: true});
  } catch (err) {
    throw new Error(`Failed to create directory ${directory}: ${err.message}`);
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

      try {
        ensureDirectoryExists(targetPath);
        await copyFiles(sourcePath, targetPath);
      } catch (err) {
        throw new Error(`Failed to process phase ${phase.id} (source: ${sourcePath}, target: ${targetPath}): ${err.message}`);
      }
    }
  }
};

try {
  rmSync(devCdnDir, { recursive: true, force: true });
  ensureDirectoryExists(devCdnDir); 

  await copyDagPhaseFiles();
} catch (err) {
  console.error(chalk.red(`Error during copy process: ${err.message}`));
  process.exit(1);
}
