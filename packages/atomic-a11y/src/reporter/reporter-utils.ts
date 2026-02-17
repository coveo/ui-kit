import {readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {getCriterionMetadata as lookupCriterionMetadata} from '../data/criterion-metadata.js';
import type {CriterionMetadata, SupportedFramework} from '../shared/types.js';

export interface PackageMetadata {
  version?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export interface StorybookTaskMeta {
  storyId?: unknown;
  reports?: unknown;
}

export interface StorybookReport {
  type?: unknown;
  result?: unknown;
}

export interface ComponentAccumulator {
  name: string;
  category: string;
  framework: SupportedFramework;
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

export function readPackageMetadata(packageJsonPath?: string): PackageMetadata {
  try {
    const currentFilePath = fileURLToPath(import.meta.url);
    const resolvedPackageJsonPath =
      packageJsonPath ??
      path.resolve(path.dirname(currentFilePath), '../../package.json');
    const packageJsonContent = readFileSync(resolvedPackageJsonPath, 'utf8');
    return JSON.parse(packageJsonContent) as PackageMetadata;
  } catch {
    return {};
  }
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
