import {mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import type {Result as AxeRuleResult} from 'axe-core';
import type {
  Reporter,
  SerializedError,
  TestCase,
  TestModule,
  TestRunEndReason,
} from 'vitest/node';
import {
  DEFAULT_A11Y_REPORT_FILENAME,
  DEFAULT_A11Y_REPORT_OUTPUT_DIR,
  DEFAULT_WCAG_22_AA_CRITERIA_COUNT,
} from '../shared/constants.js';
import {
  getCriteriaForRule,
  getIncompleteMessage,
  isAxeResults,
} from './axe-integration.js';
import {buildA11yReport} from './report-builder.js';
import {
  type ComponentAccumulator,
  type PackageMetadata,
  readPackageMetadata,
  type StorybookTaskMeta,
} from './reporter-utils.js';
import {resolveShardInfo, type ShardInfo} from './shard-resolution.js';
import {extractComponentName, normalizePath} from './storybook-extraction.js';

const REPORTER_NAME = 'VitestA11yReporter';

/**
 * Configuration options for {@link VitestA11yReporter}.
 */
export interface A11yReporterOptions {
  /** Directory where JSON reports are written.
   * @default 'a11y/reports' */
  outputDir?: string;

  /** Report filename.
   * @default 'a11y-report.json' */
  outputFilename?: string;

  /** Total WCAG 2.2 AA criteria used to calculate coverage percentages.
   * @default 55 */
  totalCriteria?: number;

  /** Path to a `package.json` from which product/tool versions are read (e.g. atomic package). */
  packageJsonPath?: string;
}

/**
 * Custom Vitest reporter that captures axe-core accessibility results from
 * Storybook test runs and produces a structured WCAG 2.2 AA JSON report.
 *
 * for more info on Vitest reporters, visit https://vitest.dev/api/advanced/reporters.html
 *
 * ## Lifecycle
 *
 * 1. Vitest calls {@link onTestCaseResult} for each completed test case.
 * 2. The reporter filters for Storybook projects, extracts axe results from
 *    test metadata, and accumulates per-component violation/pass/incomplete/inapplicable counts.
 * 3. At the end of the run, {@link onTestRunEnd} builds the final
 *    {@link A11yReport} and writes it to disk.
 *
 * ## Output
 *
 * - `a11y-report.json` — always written.
 * - `a11y-report.shard-N.json` — additionally written when running with
 *   the `--shard` CLI flag.
 *
 * @example
 * ```ts
 * // vitest.config.ts
 * import {VitestA11yReporter} from '@coveo/atomic-a11y';
 *
 * export default defineConfig({
 *   test: {
 *     reporters: [new VitestA11yReporter({ outputDir: 'reports' })],
 *   },
 * });
 * ```
 */
export class VitestA11yReporter implements Reporter {
  private readonly componentResults = new Map<string, ComponentAccumulator>();
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

  /**
   * Processes a single Storybook test case. Extracts axe-core results from
   * test metadata and accumulates per-component accessibility data.
   *
   * Silently skips non-Storybook projects, non-atomic components, and
   * duplicate story IDs.
   */
  public onTestCaseResult(testCase: TestCase): void {
    try {
      if (!testCase.project.name.startsWith('storybook')) {
        return;
      }

      const meta = testCase.meta() as StorybookTaskMeta;
      const reports = meta.reports ?? [];
      const a11yReport = reports.find((report) => report.type === 'a11y');
      const axeResults =
        a11yReport && isAxeResults(a11yReport.result)
          ? a11yReport.result
          : null;

      if (!axeResults) {
        return;
      }

      const storyId = meta.storyId ?? testCase.id;
      const modulePath = normalizePath(
        testCase.module.relativeModuleId ?? testCase.module.moduleId
      );
      const componentName = extractComponentName(modulePath, storyId);

      if (!componentName) {
        return;
      }

      const component = this.getOrCreateComponent(componentName);

      if (component.storyIds.has(storyId)) {
        return;
      }
      component.storyIds.add(storyId);

      const buckets = [
        'violations',
        'passes',
        'incomplete',
        'inapplicable',
      ] as const;
      for (const bucket of buckets) {
        component.automated[bucket] += axeResults[bucket].length;
        this.collectCriteria(component, axeResults[bucket]);
      }

      for (const incompleteRule of axeResults.incomplete) {
        component.automated.incompleteDetails.push({
          ruleId: incompleteRule.id,
          impact: incompleteRule.impact ?? 'unknown',
          wcagCriteria: getCriteriaForRule(incompleteRule),
          nodes: incompleteRule.nodes.length,
          message: getIncompleteMessage(incompleteRule),
        });
      }
    } catch (error) {
      this.warn('Unable to process Storybook a11y test result.', error);
    }
  }

  /**
   * Builds the {@link A11yReport} from accumulated results and writes it as
   * JSON to the configured output directory. No-ops if no results were captured.
   */
  public async onTestRunEnd(
    _testModules: ReadonlyArray<TestModule>,
    _unhandledErrors: ReadonlyArray<SerializedError>,
    _reason: TestRunEndReason
  ): Promise<void> {
    try {
      if (this.componentResults.size === 0) {
        return;
      }

      const report = buildA11yReport(
        this.componentResults,
        this.totalCriteria,
        this.packageMetadata
      );
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

  private getOrCreateComponent(componentName: string): ComponentAccumulator {
    const existing = this.componentResults.get(componentName);
    if (existing) {
      return existing;
    }

    const component: ComponentAccumulator = {
      name: componentName,
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
      for (const criterion of getCriteriaForRule(rule)) {
        component.automated.criteriaCovered.add(criterion);
      }
    }
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
