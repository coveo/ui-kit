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
import type {
  A11yAutomatedResults,
  A11yComponentReport,
  A11yCriterionReport,
  A11yIncompleteDetail,
  A11yReport,
  A11ySummary,
  SupportedFramework,
} from '../shared/types.js';
import {
  extractCriteriaFromTags,
  getCriteriaForRule,
  getCriteriaForRuleId,
  getIncompleteMessage,
  isAxeResults,
} from './axe-integration.js';
import {
  type ComponentAccumulator,
  extractA11yRuleIdsFromTestErrors,
  extractCategory,
  extractComponentName,
  extractFramework,
  formatDate,
  getAutomationCoveragePercentage,
  getCriterionMetadata,
  normalizePath,
  type PackageMetadata,
  readPackageMetadata,
  resolveShardInfo,
  type ShardInfo,
  type StorybookReport,
  type StorybookTaskMeta,
  stripAnsiSequences,
  UNKNOWN_CATEGORY,
  UNKNOWN_FRAMEWORK,
} from './reporter-utils.js';

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

export interface A11yReporterOptions {
  outputDir?: string;
  outputFilename?: string;
  totalCriteria?: number;
  packageJsonPath?: string;
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
        : extractA11yRuleIdsFromTestErrors(testCase, getCriteriaForRuleId);

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
      storyIds: new Set(),
      automated: {
        violations: 0,
        passes: 0,
        incomplete: 0,
        inapplicable: 0,
        criteriaCovered: new Set(),
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
      for (const criterion of criteria) {
        component.automated.criteriaCovered.add(criterion);
        const components = this.criteriaToComponents.get(criterion);
        if (components) {
          components.add(component.name);
        } else {
          this.criteriaToComponents.set(criterion, new Set([component.name]));
        }
      }
    }
  }

  private collectCriteriaFromRuleIds(
    component: ComponentAccumulator,
    ruleIds: string[]
  ): void {
    for (const ruleId of ruleIds) {
      const criteria = getCriteriaForRuleId(ruleId);
      for (const criterion of criteria) {
        component.automated.criteriaCovered.add(criterion);
        const components = this.criteriaToComponents.get(criterion);
        if (components) {
          components.add(component.name);
        } else {
          this.criteriaToComponents.set(criterion, new Set([component.name]));
        }
      }
    }
  }

  private buildReport(): A11yReport {
    const now = formatDate(new Date());
    const components: Record<string, A11yComponentReport> = {};

    for (const component of this.componentResults.values()) {
      const criteria: Record<string, A11yCriterionReport> = {};

      for (const criterionId of component.automated.criteriaCovered) {
        const metadata = getCriterionMetadata(criterionId);
        criteria[criterionId] = {
          wcagLevel: metadata.level,
          wcagVersion: metadata.wcagVersion,
          wcagCriterion: metadata.name,
          automated: {
            pass: 0,
            fail: 0,
            incomplete: 0,
            inapplicable: 0,
          },
        };
      }

      components[component.name] = {
        wcagCategory: component.category,
        framework: component.framework,
        storyIds: Array.from(component.storyIds),
        automated: {
          violations: component.automated.violations,
          passes: component.automated.passes,
          incomplete: component.automated.incomplete,
          inapplicable: component.automated.inapplicable,
          criteria,
          incompleteDetails: component.automated.incompleteDetails,
        },
      };
    }

    const automatedResults: A11yAutomatedResults = {
      date: now,
      components,
    };

    const summary: A11ySummary = {
      automationCoveragePercentage: getAutomationCoveragePercentage(
        this.criteriaToComponents.size,
        this.totalCriteria
      ),
      criteriaCount: {
        total: this.totalCriteria,
        covered: this.criteriaToComponents.size,
        uncovered: this.totalCriteria - this.criteriaToComponents.size,
      },
    };

    const report: A11yReport = {
      metadata: {
        date: now,
        packageVersion: this.packageMetadata.version ?? 'unknown',
      },
      automatedResults,
      summary,
    };

    if (this.shardInfo) {
      report.metadata.shard = this.shardInfo;
    }

    return report;
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
