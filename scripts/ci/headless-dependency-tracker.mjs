#!/usr/bin/env node
import {join} from 'node:path';
import buildConfig from '../../packages/headless/build.config.json' with {
  type: 'json',
};
import {listExportsFromIndex} from './list-imports.mjs';

function getHeadlessPackageName(useCase) {
  const prefix = '@coveo/headless';
  return useCase === 'search' ? prefix : `${prefix}/${useCase}`;
}

/**
 * Builds a dependency tree for headless endpoints based on their index files.
 * The dependency tree maps each endpoint to the files it depends on.
 *
 * @param {string} projectRoot - Absolute path to the project root directory
 * @returns {Map<string, string[]>} - Map of endpoint names to their dependency file paths
 */
function getHeadlessIndexDependencyTree(projectRoot) {
  const depTree = new Map();
  const {useCaseEntries} = buildConfig;
  const headlessPackageRoot = join(projectRoot, 'packages', 'headless');

  for (const [endpointName, indexFilePath] of Object.entries(useCaseEntries)) {
    const absoluteIndexFilePath = join(headlessPackageRoot, indexFilePath);

    try {
      depTree.set(
        endpointName,
        listExportsFromIndex(projectRoot, absoluteIndexFilePath)
      );
    } catch (error) {
      console.warn(
        `Error analyzing dependencies for ${endpointName}: ${error.message}`
      );
    }
  }

  return depTree;
}

function getHeadlessAffectedEndpointsForSingleFile(
  changedFilePath,
  projectRoot,
  dependencies
) {
  const absoluteChangedFilePath = join(projectRoot, changedFilePath);

  // Only process files within the headless package
  if (!changedFilePath.startsWith('packages/headless/')) {
    return [];
  }

  const affectedEndpoints = [];

  try {
    for (const [useCase, deps] of dependencies.entries()) {
      const isAffected = deps.some((dep) => {
        const absoluteDepPath = join(projectRoot, dep);
        return absoluteDepPath === absoluteChangedFilePath;
      });

      if (isAffected) {
        affectedEndpoints.push(getHeadlessPackageName(useCase));
      }
    }
  } catch (error) {
    console.warn(
      `Error analyzing dependencies for ${endpointName}: ${error.message}`
    );
  }

  return affectedEndpoints;
}

/**
 * Analyzes changed files to determine all unique headless endpoints that are affected.
 *
 * @param {string[]} changedFiles - Array of relative file paths from project root
 * @param {string} projectRoot - Absolute path to the project root directory
 * @returns {string[]} Array of unique affected headless package names, deduplicated
 *
 * @example
 * const changedFiles = [
 *   'packages/headless/src/controllers/search.ts',
 *   'packages/headless/src/utils/helper.ts'
 * ];
 * const affected = getAllHeadlessAffectedEndpoints(changedFiles, '/path/to/project');
 * // Returns: ['@coveo/headless', '@coveo/headless/commerce']
 */
export function getAllHeadlessAffectedEndpoints(changedFiles, projectRoot) {
  const dependencies = getHeadlessIndexDependencyTree(projectRoot);

  const affectedEndpoints = changedFiles.flatMap((file) =>
    getHeadlessAffectedEndpointsForSingleFile(file, projectRoot, dependencies)
  );

  return [...new Set(affectedEndpoints)];
}
