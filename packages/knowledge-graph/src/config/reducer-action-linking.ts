/**
 * Reducer-action relationship linking configuration (Layer 3)
 *
 * Defines how to link Redux reducers to actions they handle.
 */

import fs from 'node:fs';
import type {EntityCache} from '../core/entity-cache.js';
import {resolveImports} from '../parsers/index.js';
import type {PackageType} from './path-helpers.js';
import {getFeatureFromPath, getPackageFromPath} from './path-helpers.js';

export interface ActionRefReference {
  actionRef: string;
  feature: string;
}

/**
 * Reducer-action linking rules
 */
export const reducerActionLinking = {
  // Glob patterns for reducer files
  reducerGlob: 'packages/headless/src/features/**/*-slice.ts',

  // Patterns to ignore (none for reducers currently)
  reducerIgnore: [],

  // Relationship type
  relationshipLabel: 'HANDLES',

  /**
   * Extract reducer ID from file path
   * @param filePath - Full path to reducer file
   * @param cache - Entity cache
   * @returns Reducer ID
   */
  getSourceId: (filePath: string, cache: EntityCache): number | undefined => {
    const content = fs.readFileSync(filePath, 'utf-8');

    // Match: export const featureReducer = createReducer(...)
    const reducerMatch = content.match(
      /export\s+const\s+(\w+Reducer)\s+=\s+createReducer/
    );

    if (!reducerMatch) return undefined;

    const reducerName = reducerMatch[1];
    const packageType: PackageType = getPackageFromPath(filePath);

    return cache.get(`reducer:${reducerName}:${packageType}`);
  },

  /**
   * Extract action references from reducer file
   * @param filePath - Full path to reducer file
   * @returns Array of action references
   */
  extractReferences: (filePath: string): ActionRefReference[] => {
    const content = fs.readFileSync(filePath, 'utf-8');
    const reducerFeature = getFeatureFromPath(filePath);

    // Use ts-morph to resolve action imports properly
    const {importSources} = resolveImports(filePath);

    // Extract what actions this reducer handles using .addCase(actionName, ...)
    const addCaseMatches = content.matchAll(
      /\.addCase\s*\(\s*(\w+)(?:\.fulfilled|\.rejected|\.pending)?\s*,/g
    );

    const references: ActionRefReference[] = [];
    for (const caseMatch of addCaseMatches) {
      const actionRef = caseMatch[1]; // e.g., "nextPage" or "fetchPage"

      // Find which file this action was imported from
      const importSource = importSources.get(actionRef);

      let actionFeature = 'unknown';
      if (importSource) {
        if (importSource.includes('../')) {
          // Relative import - extract feature from import path
          const featureMatch = importSource.match(/features\/([^/]+)\//);
          if (featureMatch) {
            actionFeature = featureMatch[1];
          }
        } else if (importSource.startsWith('./')) {
          // Same-folder import - use the reducer's own feature
          actionFeature = reducerFeature;
        }
      }

      references.push({
        actionRef,
        feature: actionFeature,
      });
    }

    return references;
  },

  /**
   * Generate cache keys for finding action (most specific to least specific)
   * @param reference - Reference object from extractReferences
   * @returns Cache keys in order of specificity
   */
  generateTargetKeys: (reference: ActionRefReference): string[] => {
    const {actionRef, feature} = reference;

    return [`action:${actionRef}:${feature}`, `action:${actionRef}`];
  },
};
