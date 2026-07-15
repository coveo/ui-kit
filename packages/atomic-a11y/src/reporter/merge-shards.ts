import {mkdir, readdir, readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {
  getInteractiveCriteriaFailed,
  getInteractiveCriteriaPassed,
  getInteractiveCriteriaWarnings,
} from '../shared/evidence.js';
import {isA11yReport} from '../shared/guards.js';
import {compareByName, compareByNumericId} from '../shared/sorting.js';
import type {
  A11yAutomatedResults,
  A11yComponentReport,
  A11yCriterionReport,
  A11yInteractiveResults,
  A11yReport,
} from '../shared/types.js';
import {buildCriteria} from './report-builder.js';
import {formatDate} from './reporter-utils.js';
import {createSummary} from './summary.js';

const SHARD_FILE_PATTERN = /^a11y-report\.shard-(\d+)\.json$/;

interface MergeShardOptions {
  /** Full path (directory + filename) where the merged report is written. Shard files are read from the same directory. */
  outputFile: string;
}

interface MutableAutomatedResults extends Omit<
  A11yAutomatedResults,
  'criteriaCovered' | 'criteriaViolated' | 'criteriaPassed'
> {
  criteriaCovered: Set<string>;
  criteriaViolated: Set<string>;
  criteriaPassed: Set<string>;
}

interface MutableInteractiveResults extends Omit<
  A11yInteractiveResults,
  'criteriaCovered' | 'criteriaPassed' | 'criteriaFailed' | 'criteriaWarnings'
> {
  criteriaCovered: Set<string>;
  criteriaPassed: Set<string>;
  criteriaFailed: Set<string>;
  criteriaWarnings: Set<string>;
}

interface MutableComponentReport extends Omit<
  A11yComponentReport,
  'automated' | 'interactive'
> {
  automated: MutableAutomatedResults;
  interactive?: MutableInteractiveResults;
}

function toMutableComponent(
  component: A11yComponentReport
): MutableComponentReport {
  return {
    ...component,
    automated: {
      ...component.automated,
      criteriaCovered: new Set(component.automated.criteriaCovered),
      criteriaViolated: new Set(component.automated.criteriaViolated),
      criteriaPassed: new Set(component.automated.criteriaPassed),
      incompleteDetails: [...component.automated.incompleteDetails],
    },
    interactive: component.interactive
      ? {
          ...component.interactive,
          criteriaCovered: new Set(component.interactive.criteriaCovered),
          criteriaPassed: new Set(
            getInteractiveCriteriaPassed(component.interactive)
          ),
          criteriaFailed: new Set(
            getInteractiveCriteriaFailed(component.interactive)
          ),
          criteriaWarnings: new Set(
            getInteractiveCriteriaWarnings(component.interactive)
          ),
        }
      : undefined,
  };
}

async function readShardReports(shardFiles: string[]): Promise<A11yReport[]> {
  const reports: A11yReport[] = [];

  for (const shardFile of shardFiles) {
    try {
      const content = await readFile(shardFile, 'utf8');
      const parsed = JSON.parse(content) as unknown;

      if (!isA11yReport(parsed)) {
        console.warn(
          `[merge-shards] Skipping shard file: ${path.basename(shardFile)} — Invalid report structure`
        );
        continue;
      }

      reports.push(parsed);
    } catch (error) {
      console.warn(
        `[merge-shards] Skipping shard file: ${path.basename(shardFile)} — ${error instanceof Error ? error.message : 'unknown error'}`
      );
    }
  }

  return reports;
}

export function mergeComponents(reports: A11yReport[]): A11yComponentReport[] {
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

      for (const criterion of component.automated.criteriaViolated) {
        existing.automated.criteriaViolated.add(criterion);
      }

      for (const criterion of component.automated.criteriaPassed) {
        existing.automated.criteriaPassed.add(criterion);
      }

      existing.automated.incompleteDetails.push(
        ...component.automated.incompleteDetails
      );

      if (component.interactive) {
        mergeInteractiveResults(existing, component.interactive);
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
            compareByNumericId
          ),
          criteriaViolated: [...component.automated.criteriaViolated].sort(
            compareByNumericId
          ),
          criteriaPassed: [...component.automated.criteriaPassed].sort(
            compareByNumericId
          ),
        },
        interactive: component.interactive
          ? {
              ...component.interactive,
              criteriaCovered: [...component.interactive.criteriaCovered].sort(
                compareByNumericId
              ),
              criteriaPassed: [...component.interactive.criteriaPassed].sort(
                compareByNumericId
              ),
              criteriaFailed: [...component.interactive.criteriaFailed].sort(
                compareByNumericId
              ),
              criteriaWarnings: [
                ...component.interactive.criteriaWarnings,
              ].sort(compareByNumericId),
            }
          : undefined,
      };
    })
    .sort((first, second) => compareByName(first.name, second.name));
}

function mergeInteractiveResults(
  target: MutableComponentReport,
  source: A11yInteractiveResults
): void {
  const criteriaPassed = getInteractiveCriteriaPassed(source);
  const criteriaFailed = getInteractiveCriteriaFailed(source);
  const criteriaWarnings = getInteractiveCriteriaWarnings(source);

  if (!target.interactive) {
    target.interactive = {
      criteriaCovered: new Set(source.criteriaCovered),
      criteriaPassed: new Set(criteriaPassed),
      criteriaFailed: new Set(criteriaFailed),
      criteriaWarnings: new Set(criteriaWarnings),
      testCount: source.testCount,
      passedCount: source.passedCount,
    };
    return;
  }

  target.interactive.testCount += source.testCount;
  target.interactive.passedCount += source.passedCount;

  for (const criterion of source.criteriaCovered) {
    target.interactive.criteriaCovered.add(criterion);
  }
  for (const criterion of criteriaPassed) {
    target.interactive.criteriaPassed.add(criterion);
  }
  for (const criterion of criteriaFailed) {
    target.interactive.criteriaFailed.add(criterion);
  }
  for (const criterion of criteriaWarnings) {
    target.interactive.criteriaWarnings.add(criterion);
  }
}

export function mergeCriteria(
  _reports: A11yReport[],
  components: A11yComponentReport[]
): A11yCriterionReport[] {
  return buildCriteria(components);
}

function mergeEvaluationMethods(reports: A11yReport[]): string[] {
  const methods = new Set<string>();
  for (const report of reports) {
    for (const method of report.report.evaluationMethods) {
      methods.add(method);
    }
  }
  return [...methods];
}

export async function mergeA11yShardReports(
  options: MergeShardOptions
): Promise<A11yReport | null> {
  const outputFile = path.resolve(options.outputFile);
  const inputDir = path.dirname(outputFile);
  console.log(`[merge-shards] Scanning for shard reports in ${inputDir}`);

  let directoryEntries: string[];
  try {
    directoryEntries = await readdir(inputDir);
  } catch {
    console.warn(`[merge-shards] Could not read directory: ${inputDir}`);
    return null;
  }

  const shardFiles = directoryEntries
    .map((entry) => {
      const match = entry.match(SHARD_FILE_PATTERN);
      return match ? {entry, index: Number.parseInt(match[1], 10)} : null;
    })
    .filter((item): item is {entry: string; index: number} => item !== null)
    .sort((first, second) => first.index - second.index)
    .map(({entry}) => path.join(inputDir, entry));

  if (shardFiles.length === 0) {
    console.warn(`[merge-shards] No shard reports were found in ${inputDir}`);
    return null;
  }

  console.log(
    `[merge-shards] Found ${shardFiles.length} shard files, reading...`
  );

  const shardReports = await readShardReports(shardFiles);
  if (shardReports.length === 0) {
    console.warn('[merge-shards] No valid shard report could be loaded.');
    return null;
  }

  console.log(
    `[merge-shards] Loaded ${shardReports.length} valid shard reports, merging...`
  );

  const components = mergeComponents(shardReports);
  const criteria = mergeCriteria(shardReports, components);
  const baseReport = shardReports[0];
  const evaluationMethods = mergeEvaluationMethods(shardReports);
  const mergedReport: A11yReport = {
    report: {
      ...baseReport.report,
      reportDate: formatDate(new Date()),
      evaluationMethods,
    },
    components,
    criteria,
    summary: createSummary(components, criteria),
  };

  await mkdir(path.dirname(outputFile), {recursive: true});
  await writeFile(
    outputFile,
    `${JSON.stringify(mergedReport, null, 2)}\n`,
    'utf8'
  );

  console.log(
    `[merge-shards] Merged ${components.length} components and ${criteria.length} criteria into ${outputFile}`
  );

  return mergedReport;
}
