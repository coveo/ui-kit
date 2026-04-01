import {mkdir, readdir, readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {
  DEFAULT_A11Y_REPORT_FILENAME,
  DEFAULT_A11Y_REPORT_OUTPUT_DIR,
} from '../shared/constants.js';
import {isA11yReport} from '../shared/guards.js';
import {compareByName, compareByNumericId} from '../shared/sorting.js';
import type {
  A11yAutomatedResults,
  A11yComponentReport,
  A11yCriterionReport,
  A11yInteractiveResults,
  A11yReport,
} from '../shared/types.js';
import {formatDate, getCriterionMetadata} from './reporter-utils.js';
import {createSummary} from './summary.js';

const SHARD_FILE_PATTERN = /^a11y-report\.shard-(\d+)\.json$/;

interface MergeShardOptions {
  inputDir?: string;
  outputFile?: string;
}

interface MutableAutomatedResults
  extends Omit<A11yAutomatedResults, 'criteriaCovered'> {
  criteriaCovered: Set<string>;
}

interface MutableInteractiveResults
  extends Omit<A11yInteractiveResults, 'criteriaCovered' | 'failedCriteria'> {
  criteriaCovered: Set<string>;
  failedCriteria: Set<string>;
}

interface MutableComponentReport
  extends Omit<A11yComponentReport, 'automated' | 'interactive'> {
  automated: MutableAutomatedResults;
  interactive?: MutableInteractiveResults;
}

interface MutableCriterionReport
  extends Omit<A11yCriterionReport, 'affectedComponents'> {
  affectedComponents: Set<string>;
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
    interactive: component.interactive
      ? {
          ...component.interactive,
          criteriaCovered: new Set(component.interactive.criteriaCovered),
          failedCriteria: new Set(component.interactive.failedCriteria),
        }
      : undefined,
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

async function readShardReports(shardFiles: string[]): Promise<A11yReport[]> {
  const results = await Promise.allSettled(
    shardFiles.map(async (shardFile) => {
      const content = await readFile(shardFile, 'utf8');
      const parsed = JSON.parse(content) as unknown;

      if (!isA11yReport(parsed)) {
        throw new Error('Invalid report structure');
      }

      return parsed;
    })
  );

  const reports: A11yReport[] = [];
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    if (result.status === 'fulfilled') {
      reports.push(result.value);
    } else {
      console.warn(
        `[merge-shards] Skipping shard file: ${path.basename(shardFiles[i])} — ${result.reason instanceof Error ? result.reason.message : 'unknown error'}`
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
        },
        interactive: component.interactive
          ? {
              ...component.interactive,
              criteriaCovered: [...component.interactive.criteriaCovered].sort(
                compareByNumericId
              ),
              failedCriteria: [...component.interactive.failedCriteria].sort(
                compareByNumericId
              ),
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
  if (!target.interactive) {
    target.interactive = {
      criteriaCovered: new Set(source.criteriaCovered),
      testCount: source.testCount,
      passedCount: source.passedCount,
      failedCount: source.failedCount,
      failedCriteria: new Set(source.failedCriteria),
    };
    return;
  }

  target.interactive.testCount += source.testCount;
  target.interactive.passedCount += source.passedCount;
  target.interactive.failedCount += source.failedCount;

  for (const criterion of source.criteriaCovered) {
    target.interactive.criteriaCovered.add(criterion);
  }

  for (const criterion of source.failedCriteria) {
    target.interactive.failedCriteria.add(criterion);
  }
}

export function mergeCriteria(
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

      if (criterion.interactiveCoverage) {
        existing.interactiveCoverage = true;
      }

      if (criterion.interactiveStatus) {
        existing.interactiveStatus = mergeInteractiveStatus(
          existing.interactiveStatus,
          criterion.interactiveStatus
        );
      }
    }
  }

  let inferredCriteriaCount = 0;

  for (const component of components) {
    for (const criterionId of component.automated.criteriaCovered) {
      const existing = criteriaById.get(criterionId);
      if (existing) {
        existing.affectedComponents.add(component.name);
        continue;
      }

      inferredCriteriaCount++;
      const metadata = getCriterionMetadata(criterionId);
      criteriaById.set(criterionId, {
        id: criterionId,
        name: metadata.name,
        level: metadata.level,
        wcagVersion: metadata.wcagVersion,
        conformance: 'notEvaluated',
        automatedCoverage: true,
        interactiveCoverage: false,
        manualVerified: false,
        remarks: '',
        affectedComponents: new Set([component.name]),
      });
    }

    if (component.interactive) {
      for (const criterionId of component.interactive.criteriaCovered) {
        const existing = criteriaById.get(criterionId);
        if (existing) {
          existing.interactiveCoverage = true;
          const isFailed =
            component.interactive.failedCriteria.includes(criterionId);
          const nextStatus: 'passed' | 'failed' = isFailed
            ? 'failed'
            : 'passed';
          existing.interactiveStatus = mergeInteractiveStatus(
            existing.interactiveStatus,
            nextStatus
          );
          existing.affectedComponents.add(component.name);
        }
      }
    }
  }

  if (inferredCriteriaCount > 0) {
    console.warn(
      `[merge-shards] ${inferredCriteriaCount} criteria were inferred from component coverage but not present in any shard's criteria list.`
    );
  }

  return [...criteriaById.values()]
    .map((criterion): A11yCriterionReport => {
      return {
        ...criterion,
        affectedComponents: [...criterion.affectedComponents].sort(
          compareByName
        ),
      };
    })
    .sort((first, second) => compareByNumericId(first.id, second.id));
}

function mergeInteractiveStatus(
  current: 'passed' | 'failed' | 'mixed' | undefined,
  incoming: 'passed' | 'failed' | 'mixed'
): 'passed' | 'failed' | 'mixed' {
  if (!current) {
    return incoming;
  }

  if (current === incoming) {
    return current;
  }

  return 'mixed';
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
  options: MergeShardOptions = {}
): Promise<A11yReport | null> {
  const inputDir = path.resolve(
    options.inputDir ?? DEFAULT_A11Y_REPORT_OUTPUT_DIR
  );
  const outputFile = path.resolve(
    options.outputFile ?? path.join(inputDir, DEFAULT_A11Y_REPORT_FILENAME)
  );
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
