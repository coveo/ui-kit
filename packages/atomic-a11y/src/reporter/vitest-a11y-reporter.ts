import {readFileSync} from 'node:fs';
import {mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import type {AxeResults, Result as AxeRuleResult} from 'axe-core';
import type {
  Reporter,
  SerializedError,
  TestCase,
  TestModule,
  TestRunEndReason,
} from 'vitest/node';
import {
  buildAxeRuleCriteriaMap,
  ruleToWCAG,
} from '../data/axe-rule-mappings.js';
import {criterionMetadataMap} from '../data/criterion-metadata.js';
import {
  DEFAULT_A11Y_REPORT_FILENAME,
  DEFAULT_A11Y_REPORT_OUTPUT_DIR,
  DEFAULT_WCAG_22_AA_CRITERIA_COUNT,
} from '../shared/constants.js';
import {isRecord} from '../shared/guards.js';
import type {
  A11yAutomatedResults,
  A11yComponentReport,
  A11yCriterionReport,
  A11yIncompleteDetail,
  A11yReport,
  A11ySummary,
  CriterionMetadata,
  SupportedFramework,
} from '../shared/types.js';

export {
  DEFAULT_A11Y_REPORT_OUTPUT_DIR,
  DEFAULT_A11Y_REPORT_FILENAME,
  DEFAULT_WCAG_22_AA_CRITERIA_COUNT,
};
export type {
  A11yIncompleteDetail,
  A11yAutomatedResults,
  A11yComponentReport,
  A11yCriterionReport,
  A11ySummary,
  A11yReport,
};

const REPORTER_NAME = 'VitestA11yReporter';
const UNKNOWN_CATEGORY = 'unknown';
const UNKNOWN_FRAMEWORK = 'unknown';
const AXE_RULE_URL_PATTERN = /rules\/axe\/[\d.]+\/([a-z0-9-]+)/gi;
const AXE_RULE_TOKEN_PATTERN = /\(([a-z0-9-]+)\)/gi;
// TODO: Consider using a more robust ANSI escape code parser if needed, such as the 'ansi-regex' package.
// biome-ignore lint/suspicious/noControlCharactersInRegex: In progress...
const ANSI_ESCAPE_PATTERN = /\u001B\[[0-?]*[ -/]*[@-~]/g;

const axeRuleCriteriaMap = buildAxeRuleCriteriaMap();

interface PackageMetadata {
  version?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

interface StorybookTaskMeta {
  storyId?: unknown;
  reports?: unknown;
}

interface StorybookReport {
  type?: unknown;
  result?: unknown;
}

interface ShardInfo {
  index: number;
  total: number;
}

export interface A11yReporterOptions {
  outputDir?: string;
  outputFilename?: string;
  totalCriteria?: number;
  packageJsonPath?: string;
}

interface ComponentAccumulator {
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
    incompleteDetails: A11yIncompleteDetail[];
  };
}

function isAxeResults(value: unknown): value is AxeResults {
  if (!isRecord(value)) {
    return false;
  }

  return (
    Array.isArray(value.violations) &&
    Array.isArray(value.passes) &&
    Array.isArray(value.incomplete) &&
    Array.isArray(value.inapplicable)
  );
}

function normalizePath(filePath: string): string {
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

function resolveShardInfo(): ShardInfo | null {
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

function readPackageMetadata(packageJsonPath?: string): PackageMetadata {
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

function extractComponentName(
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

function extractCategory(modulePath: string, storyId: string): string {
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

function extractFramework(modulePath: string): SupportedFramework {
  if (modulePath.endsWith('.new.stories.tsx')) {
    return 'lit';
  }

  if (modulePath.endsWith('.stories.tsx')) {
    return 'stencil';
  }

  return UNKNOWN_FRAMEWORK;
}

function extractCriteriaFromTags(tags: readonly string[]): string[] {
  const criterionTagPattern = /^wcag(\d)(\d)(\d{1,2})$/;

  return tags
    .map((tag) => tag.match(criterionTagPattern))
    .filter((match): match is RegExpMatchArray => match !== null)
    .map((match) => `${match[1]}.${match[2]}.${match[3]}`);
}

function getCriteriaForRule(rule: AxeRuleResult): string[] {
  const mappedFromRuleId = ruleToWCAG[rule.id] ?? [];
  const mappedFromTags = extractCriteriaFromTags(rule.tags);

  return [...new Set([...mappedFromRuleId, ...mappedFromTags])].sort((a, b) =>
    a.localeCompare(b, 'en-US', {numeric: true})
  );
}

function getCriteriaForRuleId(ruleId: string): string[] {
  const mappedFromRuleId = ruleToWCAG[ruleId] ?? [];
  const mappedFromAxeMetadata = axeRuleCriteriaMap.get(ruleId) ?? [];

  return [...new Set([...mappedFromRuleId, ...mappedFromAxeMetadata])].sort(
    (a, b) => a.localeCompare(b, 'en-US', {numeric: true})
  );
}

function stripAnsiSequences(text: string): string {
  return text.replace(ANSI_ESCAPE_PATTERN, '');
}

function extractErrorText(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return `${error.message}\n${error.stack ?? ''}`;
  }

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
  target: Set<string>
): void {
  matcher.lastIndex = 0;
  let match = matcher.exec(source);

  while (match) {
    const matchedRuleId = match[1]?.toLowerCase();
    if (matchedRuleId && getCriteriaForRuleId(matchedRuleId).length > 0) {
      target.add(matchedRuleId);
    }

    match = matcher.exec(source);
  }
}

function extractA11yRuleIdsFromTestErrors(testCase: TestCase): string[] {
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

    collectRuleIdMatches(errorText, AXE_RULE_URL_PATTERN, extractedRuleIds);
    collectRuleIdMatches(errorText, AXE_RULE_TOKEN_PATTERN, extractedRuleIds);
  }

  return [...extractedRuleIds].sort((a, b) =>
    a.localeCompare(b, 'en-US', {numeric: true})
  );
}

function getIncompleteMessage(rule: AxeRuleResult): string {
  const firstNode = rule.nodes[0];
  const firstCheckMessage =
    firstNode?.any[0]?.message ??
    firstNode?.all[0]?.message ??
    firstNode?.none[0]?.message;

  return firstCheckMessage ?? rule.help;
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getCriterionMetadata(criterionId: string): CriterionMetadata {
  return (
    criterionMetadataMap[criterionId] ?? {
      name: criterionId,
      level: 'unknown',
      wcagVersion: 'unknown',
    }
  );
}

function getAutomationCoveragePercentage(
  coveredCriteria: number,
  totalCriteria: number
): string {
  if (totalCriteria <= 0) {
    return '0%';
  }

  const percentage = Math.round((coveredCriteria / totalCriteria) * 100);
  return `${percentage}%`;
}

export class VitestA11yReporter implements Reporter {
  private readonly componentResults = new Map<string, ComponentAccumulator>();
  private readonly criteriaToComponents = new Map<string, Set<string>>();
  private readonly seenComponentStoryPairs = new Set<string>();
  private hasCapturedA11yResult = false;
  private readonly outputDir: string;
  private readonly outputFilename: string;
  private readonly totalCriteria: number;
  private readonly shardInfo: ShardInfo | null;
  private readonly packageMetadata: PackageMetadata;

  public constructor(options: A11yReporterOptions = {}) {
    this.outputDir = options.outputDir ?? DEFAULT_A11Y_REPORT_OUTPUT_DIR;
    this.outputFilename =
      options.outputFilename ?? DEFAULT_A11Y_REPORT_FILENAME;
    this.totalCriteria =
      options.totalCriteria ?? DEFAULT_WCAG_22_AA_CRITERIA_COUNT;
    this.shardInfo = resolveShardInfo();
    this.packageMetadata = readPackageMetadata(options.packageJsonPath);
  }

  public onTestCaseResult(testCase: TestCase): void {
    this.onTestResult(testCase);
  }

  public onTestResult(testCase: TestCase): void {
    try {
      if (!testCase.project.name.startsWith('storybook')) {
        return;
      }

      const meta = testCase.meta() as StorybookTaskMeta;
      const reports = Array.isArray(meta.reports)
        ? (meta.reports as StorybookReport[])
        : [];
      const a11yReport = reports.find((report) => report.type === 'a11y');
      const axeResults =
        a11yReport && isAxeResults(a11yReport.result)
          ? a11yReport.result
          : null;
      const failedRuleIds = axeResults
        ? []
        : extractA11yRuleIdsFromTestErrors(testCase);

      if (!axeResults && failedRuleIds.length === 0) {
        return;
      }

      const storyId =
        typeof meta.storyId === 'string' ? meta.storyId : testCase.id;
      const moduleWithRelativePath = testCase.module as TestModule & {
        relativeModuleId?: string;
      };
      const modulePath = normalizePath(
        moduleWithRelativePath.relativeModuleId ?? testCase.module.moduleId
      );
      const componentName = extractComponentName(modulePath, storyId);

      if (!componentName) {
        return;
      }

      const componentStoryKey = `${componentName}:${storyId}`;
      if (this.seenComponentStoryPairs.has(componentStoryKey)) {
        return;
      }
      this.seenComponentStoryPairs.add(componentStoryKey);

      const category = extractCategory(modulePath, storyId);
      const framework = extractFramework(modulePath);
      const component = this.getOrCreateComponent(
        componentName,
        category,
        framework
      );
      this.hasCapturedA11yResult = true;

      component.storyIds.add(storyId);

      if (axeResults) {
        component.automated.violations += axeResults.violations.length;
        component.automated.passes += axeResults.passes.length;
        component.automated.incomplete += axeResults.incomplete.length;
        component.automated.inapplicable += axeResults.inapplicable.length;

        this.collectCriteria(component, axeResults.violations);
        this.collectCriteria(component, axeResults.passes);
        this.collectCriteria(component, axeResults.incomplete);
        this.collectCriteria(component, axeResults.inapplicable);

        for (const incompleteRule of axeResults.incomplete) {
          component.automated.incompleteDetails.push({
            ruleId: incompleteRule.id,
            impact: incompleteRule.impact ?? 'unknown',
            wcagCriteria: getCriteriaForRule(incompleteRule),
            nodes: incompleteRule.nodes.length,
            message: getIncompleteMessage(incompleteRule),
          });
        }

        return;
      }

      component.automated.violations += failedRuleIds.length;
      this.collectCriteriaFromRuleIds(component, failedRuleIds);
    } catch (error) {
      this.warn('Unable to process Storybook a11y test result.', error);
    }
  }

  public async onTestRunEnd(
    _testModules: ReadonlyArray<TestModule>,
    _unhandledErrors: ReadonlyArray<SerializedError>,
    _reason: TestRunEndReason
  ): Promise<void> {
    await this.onFinished();
  }

  public async onFinished(): Promise<void> {
    try {
      if (!this.hasCapturedA11yResult) {
        return;
      }

      const report = this.buildReport();
      const serializedReport = `${JSON.stringify(report, null, 2)}\n`;
      const outputPaths = this.getOutputPaths();

      await mkdir(this.outputDir, {recursive: true});
      await Promise.all(
        outputPaths.map((outputPath) =>
          writeFile(outputPath, serializedReport, 'utf8')
        )
      );
    } catch (error) {
      this.warn('Unable to write the accessibility report JSON file.', error);
    }
  }

  private getOrCreateComponent(
    componentName: string,
    category: string,
    framework: SupportedFramework
  ): ComponentAccumulator {
    const existing = this.componentResults.get(componentName);
    if (existing) {
      if (
        existing.category === UNKNOWN_CATEGORY &&
        category !== UNKNOWN_CATEGORY
      ) {
        existing.category = category;
      }

      if (
        existing.framework === UNKNOWN_FRAMEWORK &&
        framework !== UNKNOWN_FRAMEWORK
      ) {
        existing.framework = framework;
      }

      return existing;
    }

    const component: ComponentAccumulator = {
      name: componentName,
      category,
      framework,
      storyIds: new Set<string>(),
      automated: {
        violations: 0,
        passes: 0,
        incomplete: 0,
        inapplicable: 0,
        criteriaCovered: new Set<string>(),
        incompleteDetails: [],
      },
    };

    this.componentResults.set(componentName, component);
    return component;
  }

  private collectCriteria(
    component: ComponentAccumulator,
    rules: AxeRuleResult[]
  ): void {
    for (const rule of rules) {
      const criteria = getCriteriaForRule(rule);

      this.collectCriterionCoverage(component, criteria);
    }
  }

  private collectCriteriaFromRuleIds(
    component: ComponentAccumulator,
    ruleIds: string[]
  ): void {
    for (const ruleId of ruleIds) {
      const criteria = getCriteriaForRuleId(ruleId);

      this.collectCriterionCoverage(component, criteria);
    }
  }

  private collectCriterionCoverage(
    component: ComponentAccumulator,
    criteria: string[]
  ): void {
    for (const criterion of criteria) {
      component.automated.criteriaCovered.add(criterion);

      const coveredComponents =
        this.criteriaToComponents.get(criterion) ?? new Set<string>();
      coveredComponents.add(component.name);
      this.criteriaToComponents.set(criterion, coveredComponents);
    }
  }

  private buildComponents(): A11yComponentReport[] {
    return [...this.componentResults.values()]
      .map((component): A11yComponentReport => {
        return {
          name: component.name,
          category: component.category,
          framework: component.framework,
          storyCount: component.storyIds.size,
          automated: {
            violations: component.automated.violations,
            passes: component.automated.passes,
            incomplete: component.automated.incomplete,
            inapplicable: component.automated.inapplicable,
            criteriaCovered: [...component.automated.criteriaCovered].sort(
              (a, b) => a.localeCompare(b, 'en-US', {numeric: true})
            ),
            incompleteDetails: component.automated.incompleteDetails,
          },
        };
      })
      .sort((first, second) => first.name.localeCompare(second.name, 'en-US'));
  }

  private buildCriteria(): A11yCriterionReport[] {
    return [...this.criteriaToComponents.entries()]
      .map(([criterionId, coveredComponents]): A11yCriterionReport => {
        const metadata = getCriterionMetadata(criterionId);

        return {
          id: criterionId,
          name: metadata.name,
          level: metadata.level,
          wcagVersion: metadata.wcagVersion,
          conformance: 'notEvaluated',
          automatedCoverage: true,
          manualVerified: false,
          remarks: '',
          affectedComponents: [...coveredComponents].sort((a, b) =>
            a.localeCompare(b, 'en-US')
          ),
        };
      })
      .sort((first, second) =>
        first.id.localeCompare(second.id, 'en-US', {numeric: true})
      );
  }

  private buildSummary(
    components: A11yComponentReport[],
    criteria: A11yCriterionReport[]
  ): A11ySummary {
    const litComponents = components.filter(
      (component) => component.framework === 'lit'
    ).length;
    const stencilComponents = components.filter(
      (component) => component.framework === 'stencil'
    ).length;
    const totalStories = components.reduce(
      (total, component) => total + component.storyCount,
      0
    );

    return {
      totalComponents: components.length,
      litComponents,
      stencilComponents,
      stencilExcluded: true,
      storyCoverage: {
        total: totalStories,
        withA11y: totalStories,
        excludedFromA11y: 0,
      },
      totalCriteria: this.totalCriteria,
      supports: 0,
      partiallySupports: 0,
      doesNotSupport: 0,
      notApplicable: 0,
      notEvaluated: this.totalCriteria,
      automatedCoverage: getAutomationCoveragePercentage(
        criteria.length,
        this.totalCriteria
      ),
      manualCoverage: '0%',
    };
  }

  private buildReport(): A11yReport {
    const components = this.buildComponents();
    const criteria = this.buildCriteria();
    const axeCoreVersion =
      this.packageMetadata.devDependencies?.['axe-core'] ??
      this.packageMetadata.dependencies?.['axe-core'] ??
      '4.10.3';
    const storybookVersion =
      this.packageMetadata.devDependencies?.storybook ??
      this.packageMetadata.dependencies?.storybook ??
      '10.0.8';

    return {
      report: {
        product: 'Coveo Atomic',
        version: this.packageMetadata.version ?? '3.x.x',
        standard: 'WCAG 2.2 AA',
        reportDate: formatDate(new Date()),
        evaluationMethods: [
          `axe-core ${axeCoreVersion}`,
          'Storybook addon-a11y',
          'Manual audit',
        ],
        axeCoreVersion,
        storybookVersion,
      },
      components,
      criteria,
      summary: this.buildSummary(components, criteria),
    };
  }

  private getOutputPaths(): string[] {
    const baseOutputPath = path.resolve(this.outputDir, this.outputFilename);

    if (!this.shardInfo) {
      return [baseOutputPath];
    }

    const shardOutputPath = path.resolve(
      this.outputDir,
      `a11y-report.shard-${this.shardInfo.index}.json`
    );

    return [baseOutputPath, shardOutputPath];
  }

  private warn(message: string, error?: unknown): void {
    if (error) {
      console.warn(`[${REPORTER_NAME}] ${message}`, error);
      return;
    }

    console.warn(`[${REPORTER_NAME}] ${message}`);
  }
}

export const vitestA11yReporterTestUtils = {
  extractCategory,
  extractComponentName,
  extractCriteriaFromTags,
  extractFramework,
  formatDate,
  getAutomationCoveragePercentage,
  getCriteriaForRule,
  stripAnsiSequences,
};

export default VitestA11yReporter;
