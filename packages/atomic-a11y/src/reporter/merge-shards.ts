import {mkdir, readdir, readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import type {
  A11yAutomatedResults,
  A11yComponentReport,
  A11yCriterionReport,
  A11yReport,
  A11ySummary,
} from './vitest-a11y-reporter.js';
import {
  DEFAULT_A11Y_REPORT_FILENAME,
  DEFAULT_A11Y_REPORT_OUTPUT_DIR,
  DEFAULT_WCAG_22_AA_CRITERIA_COUNT,
} from './vitest-a11y-reporter.js';

const SHARD_FILE_PATTERN = /^a11y-report\.shard-(\d+)\.json$/;

interface MergeShardOptions {
  inputDir?: string;
  outputFile?: string;
  expectedShards?: number;
  totalCriteria?: number;
}

interface MutableAutomatedResults
  extends Omit<A11yAutomatedResults, 'criteriaCovered'> {
  criteriaCovered: Set<string>;
}

interface MutableComponentReport
  extends Omit<A11yComponentReport, 'automated'> {
  automated: MutableAutomatedResults;
}

interface MutableCriterionReport
  extends Omit<A11yCriterionReport, 'affectedComponents'> {
  affectedComponents: Set<string>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isA11yReport(value: unknown): value is A11yReport {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isRecord(value.report) &&
    Array.isArray(value.components) &&
    Array.isArray(value.criteria) &&
    isRecord(value.summary)
  );
}

function toMutableComponent(
  component: A11yComponentReport
): MutableComponentReport {
  return {
    ...component,
    automated: {
      ...component.automated,
      criteriaCovered: new Set(component.automated.criteriaCovered),
      incompleteDetails: [...component.automated.incompleteDetails],
    },
  };
}

function toMutableCriterion(
  criterion: A11yCriterionReport
): MutableCriterionReport {
  return {
    ...criterion,
    affectedComponents: new Set(criterion.affectedComponents),
  };
}

function sortByNumericIdentifier(first: string, second: string): number {
  return first.localeCompare(second, 'en-US', {numeric: true});
}

function createSummary(
  components: A11yComponentReport[],
  criteria: A11yCriterionReport[],
  totalCriteria: number
): A11ySummary {
  const litComponents = components.filter(
    (component) => component.framework === 'lit'
  ).length;
  const stencilComponents = components.filter(
    (component) => component.framework === 'stencil'
  ).length;
  const totalStories = components.reduce(
    (accumulator, component) => accumulator + component.storyCount,
    0
  );
  const automatedCoverage =
    totalCriteria > 0
      ? `${Math.round((criteria.length / totalCriteria) * 100)}%`
      : '0%';

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
    totalCriteria,
    supports: 0,
    partiallySupports: 0,
    doesNotSupport: 0,
    notApplicable: 0,
    notEvaluated: totalCriteria,
    automatedCoverage,
    manualCoverage: '0%',
  };
}

async function readShardReports(shardFiles: string[]): Promise<A11yReport[]> {
  const reports: A11yReport[] = [];

  for (const shardFile of shardFiles) {
    const shardReportContent = await readFile(shardFile, 'utf8');
    const parsedShardReport = JSON.parse(shardReportContent) as unknown;

    if (!isA11yReport(parsedShardReport)) {
      console.warn(
        `[merge-shards] Skipping invalid shard file: ${path.basename(shardFile)}`
      );
      continue;
    }

    reports.push(parsedShardReport);
  }

  return reports;
}

function mergeComponents(reports: A11yReport[]): A11yComponentReport[] {
  const componentsByName = new Map<string, MutableComponentReport>();

  for (const report of reports) {
    for (const component of report.components) {
      const existing = componentsByName.get(component.name);
      if (!existing) {
        componentsByName.set(component.name, toMutableComponent(component));
        continue;
      }

      existing.storyCount += component.storyCount;
      existing.automated.violations += component.automated.violations;
      existing.automated.passes += component.automated.passes;
      existing.automated.incomplete += component.automated.incomplete;
      existing.automated.inapplicable += component.automated.inapplicable;

      for (const criterion of component.automated.criteriaCovered) {
        existing.automated.criteriaCovered.add(criterion);
      }

      existing.automated.incompleteDetails.push(
        ...component.automated.incompleteDetails
      );

      if (existing.category === 'unknown' && component.category !== 'unknown') {
        existing.category = component.category;
      }

      if (
        existing.framework === 'unknown' &&
        component.framework !== 'unknown'
      ) {
        existing.framework = component.framework;
      }
    }
  }

  return [...componentsByName.values()]
    .map((component): A11yComponentReport => {
      return {
        ...component,
        automated: {
          ...component.automated,
          criteriaCovered: [...component.automated.criteriaCovered].sort(
            sortByNumericIdentifier
          ),
        },
      };
    })
    .sort((first, second) => first.name.localeCompare(second.name, 'en-US'));
}

function mergeCriteria(
  reports: A11yReport[],
  components: A11yComponentReport[]
): A11yCriterionReport[] {
  const criteriaById = new Map<string, MutableCriterionReport>();

  for (const report of reports) {
    for (const criterion of report.criteria) {
      const existing = criteriaById.get(criterion.id);
      if (!existing) {
        criteriaById.set(criterion.id, toMutableCriterion(criterion));
        continue;
      }

      for (const componentName of criterion.affectedComponents) {
        existing.affectedComponents.add(componentName);
      }
    }
  }

  for (const component of components) {
    for (const criterionId of component.automated.criteriaCovered) {
      const existing = criteriaById.get(criterionId);
      if (existing) {
        existing.affectedComponents.add(component.name);
        continue;
      }

      criteriaById.set(criterionId, {
        id: criterionId,
        name: criterionId,
        level: 'unknown',
        wcagVersion: 'unknown',
        conformance: 'notEvaluated',
        automatedCoverage: true,
        manualVerified: false,
        remarks: '',
        affectedComponents: new Set([component.name]),
      });
    }
  }

  return [...criteriaById.values()]
    .map((criterion): A11yCriterionReport => {
      return {
        ...criterion,
        affectedComponents: [...criterion.affectedComponents].sort((a, b) =>
          a.localeCompare(b, 'en-US')
        ),
      };
    })
    .sort((first, second) => sortByNumericIdentifier(first.id, second.id));
}

export const mergeShardsTestUtils = {
  createSummary,
  mergeComponents,
  mergeCriteria,
};

export async function mergeA11yShardReports(
  options: MergeShardOptions = {}
): Promise<A11yReport | null> {
  const inputDir = path.resolve(
    options.inputDir ?? DEFAULT_A11Y_REPORT_OUTPUT_DIR
  );
  const outputFile = path.resolve(
    options.outputFile ?? path.join(inputDir, DEFAULT_A11Y_REPORT_FILENAME)
  );
  const expectedShards = options.expectedShards;
  const totalCriteria =
    options.totalCriteria ?? DEFAULT_WCAG_22_AA_CRITERIA_COUNT;

  const directoryEntries = await readdir(inputDir);
  const shardFiles = directoryEntries
    .filter((entry) => SHARD_FILE_PATTERN.test(entry))
    .sort((first, second) => {
      const firstShardIndex = Number.parseInt(
        first.match(SHARD_FILE_PATTERN)?.[1] ?? '0',
        10
      );
      const secondShardIndex = Number.parseInt(
        second.match(SHARD_FILE_PATTERN)?.[1] ?? '0',
        10
      );

      return firstShardIndex - secondShardIndex;
    })
    .map((entry) => path.join(inputDir, entry));

  if (shardFiles.length === 0) {
    console.warn(`[merge-shards] No shard reports were found in ${inputDir}`);
    return null;
  }

  if (expectedShards && shardFiles.length !== expectedShards) {
    console.warn(
      `[merge-shards] Expected ${expectedShards} shard reports, found ${shardFiles.length}.`
    );
  }

  const shardReports = await readShardReports(shardFiles);
  if (shardReports.length === 0) {
    console.warn('[merge-shards] No valid shard report could be loaded.');
    return null;
  }

  const components = mergeComponents(shardReports);
  const criteria = mergeCriteria(shardReports, components);
  const baseReport = shardReports[0];
  const mergedReport: A11yReport = {
    report: {
      ...baseReport.report,
      reportDate: new Date().toISOString().slice(0, 10),
    },
    components,
    criteria,
    summary: createSummary(components, criteria, totalCriteria),
  };

  await mkdir(path.dirname(outputFile), {recursive: true});
  await writeFile(
    outputFile,
    `${JSON.stringify(mergedReport, null, 2)}\n`,
    'utf8'
  );

  return mergedReport;
}

function wasExecutedDirectly(): boolean {
  const currentFilePath = fileURLToPath(import.meta.url);
  const entryFile = process.argv[1];

  if (!entryFile) {
    return false;
  }

  return path.resolve(entryFile) === currentFilePath;
}

async function runFromCli(): Promise<void> {
  const expectedShardsValue = process.env.A11Y_EXPECTED_SHARDS;
  const expectedShards = expectedShardsValue
    ? Number.parseInt(expectedShardsValue, 10)
    : undefined;

  await mergeA11yShardReports({
    expectedShards:
      expectedShards && Number.isInteger(expectedShards)
        ? expectedShards
        : undefined,
  });
}

if (wasExecutedDirectly()) {
  void runFromCli();
}
