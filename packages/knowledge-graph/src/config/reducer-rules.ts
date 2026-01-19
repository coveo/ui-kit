/**
 * Layer 3: Reducer Extraction Rules
 *
 * Domain-specific configuration for extracting Redux reducers from ui-kit:
 * - createReducer() - Redux Toolkit slice reducers
 *
 * Reducers live in packages/headless/src/features/ directories (*-slice.ts files)
 * Each reducer has package (search/insight/commerce/etc.) and feature context
 */

import fs from 'node:fs';
import type {PackageType} from './path-helpers.js';
import {getFeatureFromPath, getPackageFromPath} from './path-helpers.js';

export interface ReducerProperties {
  name: string;
  package: PackageType;
  feature: string;
  filePath: string;
  [key: string]: unknown;
}

export interface ReducerData {
  name: string;
  labels: string[];
  properties: ReducerProperties;
}

/**
 * Glob pattern for reducer slice files
 */
export const reducerGlob = 'packages/headless/src/features/**/*-slice.ts';

/**
 * Extract reducer from file content
 * Returns reducer definition with metadata, or null if not found
 */
export function extractReducerFromFile(
  filePath: string,
  relativePath: string
): ReducerData | null {
  const content = fs.readFileSync(filePath, 'utf-8');

  // Match: export const featureReducer = createReducer(...)
  const reducerMatch = content.match(
    /export\s+const\s+(\w+Reducer)\s+=\s+createReducer/
  );

  if (!reducerMatch) {
    return null;
  }

  const reducerName = reducerMatch[1];
  const reducerPackage = getPackageFromPath(relativePath);
  const feature = getFeatureFromPath(relativePath);

  return {
    name: reducerName,
    labels: ['Reducer'],
    properties: {
      name: reducerName,
      package: reducerPackage,
      feature,
      filePath: relativePath,
    },
  };
}

/**
 * Generate cache keys for a reducer
 * Multi-key strategy: name, name:feature, name:package, name:package:feature
 */
export function generateReducerCacheKeys(reducerData: ReducerData): string[] {
  const {name, feature, package: pkg} = reducerData.properties;

  return [
    `reducer:${name}`,
    `reducer:${name}:${feature}`,
    `reducer:${name}:${pkg}`,
    `reducer:${name}:${pkg}:${feature}`,
  ];
}
