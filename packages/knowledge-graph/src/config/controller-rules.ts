/**
 * Controller extraction rules and patterns
 *
 * Layer 3: ui-kit Domain Configuration
 */

import type {PackageType} from './path-helpers.js';
import {getPackageFromPath} from './path-helpers.js';

export {getPackageFromPath};

export interface ControllerMatch {
  buildFunction: string;
  returnType: string;
}

export interface ControllerProperties {
  name: string;
  buildFunction: string;
  className: string;
  filePath: string;
  package: PackageType;
  type: 'headless';
  [key: string]: unknown;
}

/**
 * Check if a build function should be skipped
 * @param _buildFunction - Build function name (unused)
 * @param returnType - Return type
 * @returns True if should skip
 */
export function shouldSkipController(
  _buildFunction: string,
  returnType: string
): boolean {
  // Skip generic/internal functions
  if (returnType === 'Controller' || returnType === 'void') {
    return true;
  }

  // Skip Engine types (not controllers)
  if (returnType.includes('Engine')) {
    return true;
  }

  return false;
}

/**
 * Generate cache keys for a controller
 * @param returnType - Controller class name
 * @param buildFunction - Build function name
 * @param packageType - Package type
 * @returns Array of cache keys
 */
export function generateControllerCacheKeys(
  returnType: string,
  buildFunction: string,
  packageType: PackageType
): string[] {
  const keys = [
    `controller:${returnType}`,
    `controller:${buildFunction}`,
    `controller:${returnType}:${packageType}`,
    `controller:${buildFunction}:${packageType}`,
  ];

  // Handle core controller export aliases (buildCore* → build*)
  if (buildFunction.startsWith('buildCore')) {
    const aliasedName = buildFunction.replace('buildCore', 'build');
    keys.push(`controller:${aliasedName}`);
    keys.push(`controller:${aliasedName}:${packageType}`);
  }

  return keys;
}

/**
 * Controller extraction configuration
 */
export const controllerConfig = {
  // Glob patterns for .d.ts files
  dtsGlob: 'packages/headless/dist/definitions/**/*.d.ts',

  // Patterns to ignore
  dtsIgnore: ['**/*.spec.d.ts', '**/*.test.d.ts'],

  // Labels for controller nodes
  nodeLabels: ['Controller', 'HeadlessController'],

  // Property template
  nodeProperties: (
    match: ControllerMatch,
    relativePath: string,
    packageType: PackageType
  ): ControllerProperties => ({
    name: match.returnType,
    buildFunction: match.buildFunction,
    className: match.returnType,
    filePath: relativePath,
    package: packageType,
    type: 'headless',
  }),
};
