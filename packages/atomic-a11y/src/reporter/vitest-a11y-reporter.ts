import {mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import type {AxeResults, Result as AxeRuleResult} from 'axe-core';
import type {
  Reporter,
  SerializedError,
  TestCase,
  TestModule,
  TestRunEndReason,
} from 'vitest/node';

import {
  getCriteriaForRule,
  getIncompleteMessage,
  isAxeResults,
} from './axe-integration.js';
import {buildA11yReport} from './report-builder.js';
import {
  type ComponentAccumulator,
  isInteractiveReport,
  isStorybookTaskMeta,
  type PackageMetadata,
  readPackageMetadata,
  type StorybookInteractiveReport,
  type StorybookTaskMeta,
} from './reporter-utils.js';
import {resolveShardInfo, type ShardInfo} from './shard-resolution.js';
import {extractComponentName, normalizePath} from './storybook-extraction.js';

const REPORTER_NAME = 'VitestA11yReporter';

/**
 * Configuration options for {@link VitestA11yReporter}.
 */
export interface A11yReporterOptions {
  /** Full path (directory + filename) where the JSON report is written. */
  outputFile: string;

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
 * - `a11y-report.json` — written when running without the `--shard` CLI flag.
 * - `a11y-report.shard-N.json` — written instead when running with
 *   the `--shard` CLI flag (the base file is skipped to avoid incomplete data).
 *
 * @example
 * ```ts
 * // vitest.config.ts
 * import {VitestA11yReporter} from '@coveo/atomic-a11y';
 *
 * export default defineConfig({
 *   test: {
 *     reporters: [new VitestA11yReporter({ outputFile: 'reports/a11y-report.json' })],
 *   },
 * });
 * ```
 */
export class VitestA11yReporter implements Reporter {
  private readonly componentResults = new Map<string, ComponentAccumulator>();
  private readonly outputFile: string;
  private readonly shardInfo: ShardInfo | null;
  private readonly packageMetadata: PackageMetadata;

  public constructor(options: A11yReporterOptions) {
    this.outputFile = options.outputFile;
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

      const meta = testCase.meta();
      if (!isStorybookTaskMeta(meta)) {
        return;
      }

      const axeResults = VitestA11yReporter.getAxeResults(meta);
      const interactiveReport = VitestA11yReporter.getInteractiveReport(meta);

      if (!axeResults && !interactiveReport) {
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
      if (axeResults) {
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
      }

      if (interactiveReport) {
        if (!component.interactive) {
          component.interactive = {
            criteriaCovered: new Set<string>(),
            testCount: 0,
            passedCount: 0,
            failedCount: 0,
            passedCriteria: new Set<string>(),
            failedCriteria: new Set<string>(),
          };
        }

        const testState = testCase.result()?.state;
        const effectiveStatus: StorybookInteractiveReport['status'] =
          testState === 'failed' ? 'failed' : interactiveReport.status;

        for (const criterion of interactiveReport.result.criteriaCovered) {
          component.interactive.criteriaCovered.add(criterion);
          if (effectiveStatus === 'passed') {
            component.interactive.passedCriteria.add(criterion);
          }
          if (effectiveStatus === 'failed') {
            component.interactive.failedCriteria.add(criterion);
          }
        }

        component.interactive.testCount++;
        if (effectiveStatus === 'passed') {
          component.interactive.passedCount++;
        }

        if (effectiveStatus === 'failed') {
          component.interactive.failedCount++;
        }
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
        this.packageMetadata
      );
      const serializedReport = `${JSON.stringify(report, null, 2)}\n`;
      const outputPaths = this.getOutputPaths();

      await mkdir(path.dirname(this.outputFile), {recursive: true});
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

  private static getAxeResults(meta: StorybookTaskMeta): AxeResults | null {
    const reports = meta.reports ?? [];
    const a11yReport = reports.find((report) => report.type === 'a11y');

    return a11yReport && isAxeResults(a11yReport.result)
      ? a11yReport.result
      : null;
  }

  private static getInteractiveReport(
    meta: StorybookTaskMeta
  ): StorybookInteractiveReport | null {
    const reports = meta.reports ?? [];
    const interactiveReport = reports.find((report) =>
      isInteractiveReport(report)
    );

    return interactiveReport ?? null;
  }

  private getOutputPaths(): string[] {
    if (!this.shardInfo) {
      return [this.outputFile];
    }

    const dir = path.dirname(this.outputFile);
    const ext = path.extname(this.outputFile);
    const base = path.basename(this.outputFile, ext);
    const shardOutputPath = path.resolve(
      dir,
      `${base}.shard-${this.shardInfo.index}${ext}`
    );

    return [this.outputFile, shardOutputPath];
  }

  private warn(message: string, error?: unknown): void {
    if (error) {
      console.warn(`[${REPORTER_NAME}] ${message}`, error);
      return;
    }

    console.warn(`[${REPORTER_NAME}] ${message}`);
  }
}
