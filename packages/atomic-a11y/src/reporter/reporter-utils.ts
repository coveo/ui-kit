import {existsSync, readFileSync} from 'node:fs';
import {findPackageJSON} from 'node:module';
import path from 'node:path';
import {getCriterionMetadata as lookupCriterionMetadata} from '../data/criterion-metadata.js';
import {isRecord} from '../shared/guards.js';
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

function isStorybookReport(value: unknown): value is StorybookReport {
  return isRecord(value) && typeof value.type === 'string';
}

export function isStorybookTaskMeta(
  value: unknown
): value is StorybookTaskMeta {
  if (!isRecord(value)) {
    return false;
  }

  if (Object.hasOwn(value, 'storyId') && typeof value.storyId !== 'string') {
    return false;
  }

  if (Object.hasOwn(value, 'reports')) {
    return (
      Array.isArray(value.reports) && value.reports.every(isStorybookReport)
    );
  }

  return true;
}

export interface StorybookInteractiveReport {
  type: 'a11y-interactive';
  version: number;
  status: 'passed' | 'failed' | 'warning';
  result: {
    criteriaCovered: string[];
  };
}

export function isInteractiveReport(
  report: unknown
): report is StorybookInteractiveReport {
  if (!isRecord(report)) {
    return false;
  }

  if (report.type !== 'a11y-interactive') {
    return false;
  }

  if (typeof report.version !== 'number') {
    return false;
  }

  const status = report.status;
  if (status !== 'passed' && status !== 'failed' && status !== 'warning') {
    return false;
  }

  if (!isRecord(report.result)) {
    return false;
  }

  const {criteriaCovered} = report.result;
  return (
    Array.isArray(criteriaCovered) &&
    criteriaCovered.every((criterion) => typeof criterion === 'string')
  );
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
  interactive?: {
    criteriaCovered: Set<string>;
    testCount: number;
    passedCount: number;
    failedCount: number;
    passedCriteria: Set<string>;
    failedCriteria: Set<string>;
  };
}

function resolvePackageJsonPath(packageJsonPath?: string): string {
  const searchRoot = process.cwd();
  const resolvedPath = packageJsonPath
    ? path.resolve(packageJsonPath)
    : findPackageJSON('.', `${searchRoot}${path.sep}`);

  if (resolvedPath && existsSync(resolvedPath)) {
    return resolvedPath;
  }

  throw new Error(
    `[VitestA11yReporter] package.json not found from "${packageJsonPath ?? searchRoot}". ` +
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
