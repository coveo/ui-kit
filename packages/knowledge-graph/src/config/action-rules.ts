/**
 * Layer 3: Action Extraction Rules
 *
 * Domain-specific configuration for extracting Redux actions from ui-kit:
 * - createAction() - synchronous actions
 * - createAsyncThunk<...>() - async thunks
 *
 * Actions live in packages/headless/src/features/ directories (*-actions.ts files)
 * Each action has package (search/insight/commerce/etc.) and feature context
 */

import fs from 'node:fs';
import type {PackageType} from './path-helpers.js';
import {getFeatureFromPath, getPackageFromPath} from './path-helpers.js';

export interface ActionProperties {
  name: string;
  type: string;
  package: PackageType;
  feature: string;
  filePath: string;
  actionKind: 'sync' | 'async';
  [key: string]: unknown;
}

export interface ActionData {
  name: string;
  type: string;
  labels: string[];
  properties: ActionProperties;
}

/**
 * Glob pattern for action files
 */
export const actionGlob = 'packages/headless/src/features/**/*-actions.ts';

/**
 * Extract actions from file content
 * Returns array of action definitions with metadata
 */
export function extractActionsFromFile(
  filePath: string,
  relativePath: string
): ActionData[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const actions: ActionData[] = [];

  const actionPackage = getPackageFromPath(relativePath);
  const feature = getFeatureFromPath(relativePath);

  // Pattern 1: Synchronous actions
  // export const actionName = createAction('action/type', ...)
  const syncMatches = content.matchAll(
    /export\s+const\s+(\w+)\s+=\s+createAction\s*\(\s*['"]([^'"]+)['"]/g
  );

  for (const match of syncMatches) {
    actions.push({
      name: match[1],
      type: match[2],
      labels: ['Action'],
      properties: {
        name: match[1],
        type: match[2],
        package: actionPackage,
        feature,
        filePath: relativePath,
        actionKind: 'sync',
      },
    });
  }

  // Pattern 2: Async thunks
  // export const actionName = createAsyncThunk<...>('action/type', ...)
  const asyncMatches = content.matchAll(
    /export\s+const\s+(\w+)\s+=\s+createAsyncThunk<[^(]+>\s*\(\s*['"]([^'"]+)['"]/g
  );

  for (const match of asyncMatches) {
    actions.push({
      name: match[1],
      type: match[2],
      labels: ['Action', 'AsyncAction'],
      properties: {
        name: match[1],
        type: match[2],
        package: actionPackage,
        feature,
        filePath: relativePath,
        actionKind: 'async',
      },
    });
  }

  return actions;
}

/**
 * Generate cache keys for an action
 * Multi-key strategy: name, type, name:feature, name:package, name:package:feature
 */
export function generateActionCacheKeys(actionData: ActionData): string[] {
  const {name, type, feature, package: pkg} = actionData.properties;

  return [
    `action:${name}`,
    `action:${type}`,
    `action:${name}:${feature}`,
    `action:${name}:${pkg}`,
    `action:${name}:${pkg}:${feature}`,
  ];
}

/**
 * Validate extracted action data
 */
export function isValidAction(actionData: ActionData): boolean {
  const {name, type} = actionData.properties;
  return !!(name && type);
}
