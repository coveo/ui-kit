import {existsSync, readFileSync} from 'node:fs';
import path from 'node:path';
import {getCriterionMetadata as lookupCriterionMetadata} from '../data/criterion-metadata.js';
import type {CriterionMetadata} from '../shared/types.js';

export interface PackageMetadata {
  version: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export interface StorybookReport {
  type: string;
  result?: unknown;
}

export interface StorybookTaskMeta {
  storyId?: string;
  reports?: StorybookReport[];
}

export interface ComponentAccumulator {
  name: string;
  storyIds: Set<string>;
  automated: {
    violations: number;
    passes: number;
    incomplete: number;
    inapplicable: number;
    criteriaCovered: Set<string>;
    incompleteDetails: Array<{
      ruleId: string;
      impact: string;
      wcagCriteria: string[];
      nodes: number;
      message: string;
    }>;
  };
}

function resolvePackageJsonPath(packageJsonPath?: string): string {
  const resolvedPath = packageJsonPath
    ? path.resolve(packageJsonPath)
    : path.resolve(process.cwd(), 'package.json');

  if (existsSync(resolvedPath)) {
    return resolvedPath;
  }

  throw new Error(
    `[VitestA11yReporter] package.json not found at "${resolvedPath}". ` +
      'Provide A11yReporterOptions.packageJsonPath explicitly.'
  );
}

export function readPackageMetadata(packageJsonPath?: string): PackageMetadata {
  const resolvedPath = resolvePackageJsonPath(packageJsonPath);
  const content = readFileSync(resolvedPath, 'utf8');

  let parsedMetadata: unknown;
  try {
    parsedMetadata = JSON.parse(content);
  } catch (error) {
    throw new Error(
      `[VitestA11yReporter] Invalid JSON in package metadata file "${resolvedPath}".`,
      {cause: error}
    );
  }

  return parsedMetadata as PackageMetadata;
}

export function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function getCriterionMetadata(criterionId: string): CriterionMetadata {
  return (
    lookupCriterionMetadata(criterionId) ?? {
      name: criterionId,
      level: 'unknown',
      wcagVersion: 'unknown',
    }
  );
}

export function getAutomationCoveragePercentage(
  coveredCriteria: number,
  totalCriteria: number
): string {
  if (totalCriteria <= 0) {
    return '0%';
  }

  const percentage = Math.round((coveredCriteria / totalCriteria) * 100);
  return `${percentage}%`;
}
