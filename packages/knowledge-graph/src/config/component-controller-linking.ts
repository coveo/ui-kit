/**
 * Component-controller relationship linking configuration (Layer 3)
 *
 * Defines how to link Atomic components to Headless controllers.
 */

import type {EntityCache} from '../core/entity-cache.js';
import {
  extractComponentName,
  findBuildFunctionCalls,
  resolveImports,
} from '../parsers/index.js';
import type {PackageType} from './path-helpers.js';
import {getPackageFromPath} from './path-helpers.js';

export interface ControllerReference {
  buildFunction: string;
  originalName: string;
  importSource: string;
}

/**
 * Component-controller linking rules
 */
export const componentControllerLinking = {
  // Glob patterns for component files
  componentGlob: 'packages/atomic/src/components/**/*.{ts,tsx}',

  // Patterns to ignore
  componentIgnore: ['**/*.spec.ts', '**/*.spec.tsx', '**/*.e2e.ts'],

  // Relationship type
  relationshipLabel: 'USES_CONTROLLER',

  /**
   * Extract component name from file path
   * @param filePath - Full path to component file
   * @param cache - Entity cache
   * @returns Component ID
   */
  getSourceId: (filePath: string, cache: EntityCache): number | undefined => {
    const componentName = extractComponentName(filePath);
    if (!componentName) return undefined;

    return cache.get(`component:${componentName}`);
  },

  /**
   * Extract controller references from component file
   * @param filePath - Full path to component file
   * @param _projectRoot - Project root (unused, for interface compatibility)
   * @returns Array of controller references
   */
  extractReferences: (
    filePath: string,
    _projectRoot?: string
  ): ControllerReference[] => {
    const {importMap, importSources} = resolveImports(filePath);
    const buildCalls = findBuildFunctionCalls(filePath, importMap);

    return buildCalls.map((buildFunctionName) => {
      const originalName =
        importMap.get(buildFunctionName) || buildFunctionName;
      const importSource =
        importSources.get(originalName) || importSources.get(buildFunctionName);

      return {
        buildFunction: buildFunctionName,
        originalName,
        importSource: importSource || '',
      };
    });
  },

  /**
   * Generate cache keys for finding controller (most specific to least specific)
   * @param reference - Reference object from extractReferences
   * @returns Cache keys in order of specificity
   */
  generateTargetKeys: (reference: ControllerReference): string[] => {
    const {originalName, buildFunction, importSource} = reference;
    const packageType: PackageType = getPackageFromPath(importSource || '');

    return [
      `controller:${originalName}:${packageType}`,
      `controller:${originalName}`,
      `controller:${buildFunction}`,
    ];
  },
};
