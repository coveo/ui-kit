/**
 * Controller-action relationship linking configuration (Layer 3)
 *
 * Defines how to link Headless controllers to Redux actions they dispatch.
 */

import fs from 'node:fs';
import type {EntityCache} from '../core/entity-cache.js';
import type {PackageType} from './path-helpers.js';
import {getPackageFromPath} from './path-helpers.js';

export interface ActionReference {
  actionName: string;
  package: PackageType;
}

/**
 * Controller-action linking rules
 */
export const controllerActionLinking = {
  // Glob patterns for controller files
  controllerGlob: 'packages/headless/src/controllers/**/*.ts',

  // Patterns to ignore
  controllerIgnore: ['**/*.test.ts', '**/*.spec.ts'],

  // Relationship type
  relationshipLabel: 'DISPATCHES',

  /**
   * Extract controller ID from file path
   * @param filePath - Full path to controller file
   * @param cache - Entity cache
   * @returns Controller ID
   */
  getSourceId: (filePath: string, cache: EntityCache): number | undefined => {
    const content = fs.readFileSync(filePath, 'utf-8');

    // Find build function to identify the controller
    const buildMatch = content.match(
      /export\s+function\s+(build\w+)\s*\([^)]*\)\s*:\s*(\w+)/
    );

    if (!buildMatch) return undefined;

    const buildFunctionName = buildMatch[1];
    const controllerPackage = getPackageFromPath(filePath);

    return cache.get(`controller:${buildFunctionName}:${controllerPackage}`);
  },

  /**
   * Extract action references from controller file
   * @param filePath - Full path to controller file
   * @returns Array of action references
   */
  extractReferences: (filePath: string): ActionReference[] => {
    const content = fs.readFileSync(filePath, 'utf-8');
    const packageType = getPackageFromPath(filePath);

    // Find dispatch(actionName(...)) calls
    const dispatchMatches = content.matchAll(/dispatch\s*\(\s*(\w+)\s*\(/g);

    const references: ActionReference[] = [];
    for (const dispatchMatch of dispatchMatches) {
      references.push({
        actionName: dispatchMatch[1],
        package: packageType,
      });
    }

    return references;
  },

  /**
   * Generate cache keys for finding action (most specific to least specific)
   * @param reference - Reference object from extractReferences
   * @returns Cache keys in order of specificity
   */
  generateTargetKeys: (reference: ActionReference): string[] => {
    const {actionName, package: packageType} = reference;

    return [`action:${actionName}:${packageType}`, `action:${actionName}`];
  },
};
