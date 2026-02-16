import {readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import type {TestCase} from 'vitest/node';
import {getCriterionMetadata as lookupCriterionMetadata} from '../data/criterion-metadata.js';
import {UNKNOWN_CATEGORY, UNKNOWN_FRAMEWORK} from '../shared/constants.js';
import {compareByNumericId} from '../shared/sorting.js';
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

export interface ShardInfo {
  index: number;
  total: number;
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

const AXE_RULE_URL_PATTERN = /rules\/axe\/[\d.]+\/([a-z0-9-]+)/gi;
const AXE_RULE_TOKEN_PATTERN = /\(([a-z0-9-]+)\)/gi;
// TODO: Consider using a more robust ANSI escape code parser if needed, such as the 'ansi-regex' package.
// biome-ignore lint/suspicious/noControlCharactersInRegex: In progress...
const ANSI_ESCAPE_PATTERN = /\u001B\[[0-?]*[ -/]*[@-~]/g;

export function normalizePath(filePath: string): string {
  return filePath.replaceAll('\\', '/');
}

function parseShardDescriptor(
  descriptor: string | undefined
): ShardInfo | null {
  if (!descriptor) {
    return null;
  }

  const shardMatch = descriptor.match(/^(\d+)\/(\d+)$/);
  if (!shardMatch) {
    return null;
  }

  const [, rawIndex, rawTotal] = shardMatch;
  const index = Number.parseInt(rawIndex, 10);
  const total = Number.parseInt(rawTotal, 10);

  if (Number.isNaN(index) || Number.isNaN(total) || total <= 0) {
    return null;
  }

  return {index, total};
}

function extractCliShardDescriptor(argv: string[]): string | undefined {
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument.startsWith('--shard=')) {
      return argument.slice('--shard='.length);
    }

    if (argument === '--shard') {
      return argv[index + 1];
    }
  }

  return undefined;
}

export function resolveShardInfo(): ShardInfo | null {
  const byDescriptor = [
    process.env.A11Y_REPORT_SHARD,
    process.env.VITEST_SHARD,
    extractCliShardDescriptor(process.argv),
  ]
    .map((descriptor) => parseShardDescriptor(descriptor))
    .find((parsed): parsed is ShardInfo => parsed !== null);

  if (byDescriptor) {
    return byDescriptor;
  }

  const rawIndex =
    process.env.CI_NODE_INDEX ??
    process.env.CIRCLE_NODE_INDEX ??
    process.env.BUILDKITE_PARALLEL_JOB;
  const rawTotal =
    process.env.CI_NODE_TOTAL ??
    process.env.CIRCLE_NODE_TOTAL ??
    process.env.BUILDKITE_PARALLEL_JOB_COUNT;

  if (!rawIndex || !rawTotal) {
    return null;
  }

  const parsedIndex = Number.parseInt(rawIndex, 10);
  const parsedTotal = Number.parseInt(rawTotal, 10);

  if (
    Number.isNaN(parsedIndex) ||
    Number.isNaN(parsedTotal) ||
    parsedTotal <= 0
  ) {
    return null;
  }

  const normalizedIndex =
    parsedIndex >= 1 && parsedIndex <= parsedTotal
      ? parsedIndex
      : parsedIndex >= 0 && parsedIndex < parsedTotal
        ? parsedIndex + 1
        : parsedIndex;

  if (normalizedIndex < 1 || normalizedIndex > parsedTotal) {
    return null;
  }

  return {
    index: normalizedIndex,
    total: parsedTotal,
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

export function extractComponentName(
  modulePath: string,
  storyId: string
): string | null {
  const componentPathMatch = modulePath.match(/\/((atomic-[a-z0-9-]+))\//i);
  if (componentPathMatch?.[1]) {
    return componentPathMatch[1].toLowerCase();
  }

  const storyPathMatch = modulePath.match(
    /(atomic-[a-z0-9-]+)\.new\.stories\.[jt]sx?$/i
  );
  if (storyPathMatch?.[1]) {
    return storyPathMatch[1].toLowerCase();
  }

  const storyIdMatch = storyId.match(/(atomic-[a-z0-9-]+)/i);
  if (storyIdMatch?.[1]) {
    return storyIdMatch[1].toLowerCase();
  }

  return null;
}

export function extractCategory(modulePath: string, storyId: string): string {
  const categoryFromPath = modulePath.match(
    /components\/(commerce|search|insight|ipx|common|recommendations)\//i
  );

  if (categoryFromPath?.[1]) {
    return categoryFromPath[1].toLowerCase();
  }

  const categoryFromStoryId = storyId.match(
    /^(commerce|search|insight|ipx|common|recommendations)-/i
  );

  if (categoryFromStoryId?.[1]) {
    return categoryFromStoryId[1].toLowerCase();
  }

  return UNKNOWN_CATEGORY;
}

export function extractFramework(modulePath: string): SupportedFramework {
  if (modulePath.endsWith('.new.stories.tsx')) {
    return 'lit';
  }

  if (modulePath.endsWith('.stories.tsx')) {
    return 'stencil';
  }

  return UNKNOWN_FRAMEWORK;
}

export function stripAnsiSequences(text: string): string {
  return text.replace(ANSI_ESCAPE_PATTERN, '');
}

function extractErrorText(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return `${error.message}\n${error.stack ?? ''}`;
  }

  const isRecord = (value: unknown): value is Record<string, unknown> => {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  };

  if (!isRecord(error)) {
    return '';
  }

  const message = typeof error.message === 'string' ? error.message : '';
  const stack = typeof error.stack === 'string' ? error.stack : '';
  return `${message}\n${stack}`;
}

function collectRuleIdMatches(
  source: string,
  matcher: RegExp,
  target: Set<string>,
  getCriteriaForRuleIdFn: (ruleId: string) => string[]
): void {
  matcher.lastIndex = 0;
  let match = matcher.exec(source);

  while (match) {
    const matchedRuleId = match[1]?.toLowerCase();
    if (matchedRuleId && getCriteriaForRuleIdFn(matchedRuleId).length > 0) {
      target.add(matchedRuleId);
    }

    match = matcher.exec(source);
  }
}

export function extractA11yRuleIdsFromTestErrors(
  testCase: TestCase,
  getCriteriaForRuleIdFn: (ruleId: string) => string[]
): string[] {
  const errors = testCase.result().errors;
  if (!errors || errors.length === 0) {
    return [];
  }

  const extractedRuleIds = new Set<string>();

  for (const error of errors) {
    const errorText = stripAnsiSequences(extractErrorText(error));
    if (!errorText) {
      continue;
    }

    const normalizedErrorText = errorText.toLowerCase();
    const appearsToBeA11yAssertionFailure =
      normalizedErrorText.includes('tohavenoviolations') ||
      normalizedErrorText.includes('application=axeapi');

    if (!appearsToBeA11yAssertionFailure) {
      continue;
    }

    collectRuleIdMatches(
      errorText,
      AXE_RULE_URL_PATTERN,
      extractedRuleIds,
      getCriteriaForRuleIdFn
    );
    collectRuleIdMatches(
      errorText,
      AXE_RULE_TOKEN_PATTERN,
      extractedRuleIds,
      getCriteriaForRuleIdFn
    );
  }

  return [...extractedRuleIds].sort(compareByNumericId);
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
