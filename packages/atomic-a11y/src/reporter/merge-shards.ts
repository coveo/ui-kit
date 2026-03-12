import {mkdir, readdir, readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {
  DEFAULT_A11Y_REPORT_FILENAME,
  DEFAULT_A11Y_REPORT_OUTPUT_DIR,
  DEFAULT_WCAG_22_AA_CRITERIA_COUNT,
  UNKNOWN_CATEGORY,
  UNKNOWN_FRAMEWORK,
} from '../shared/constants.js';
import {isA11yReport} from '../shared/guards.js';
import {compareByName, compareByNumericId} from '../shared/sorting.js';
import type {
  A11yAutomatedResults,
  A11yComponentReport,
  A11yCriterionReport,
  A11yReport,
} from '../shared/types.js';
import {formatDate, getCriterionMetadata} from './reporter-utils.js';
import {createSummary} from './summary.js';

const SHARD_FILE_PATTERN = /^a11y-report\.shard-(\d+)\.json$/;

interface MergeShardOptions {
  inputDir?: string;
  outputFile?: string;
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

      if (
        existing.category === UNKNOWN_CATEGORY &&
        component.category !== UNKNOWN_CATEGORY
      ) {
        existing.category = component.category;
      }

      if (
        existing.framework === UNKNOWN_FRAMEWORK &&
        component.framework !== UNKNOWN_FRAMEWORK
      ) {
        existing.framework = component.framework;
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
      };
    })
    .sort((first, second) => compareByName(first.name, second.name));
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
        manualVerified: false,
        remarks: '',
        affectedComponents: new Set([component.name]),
      });
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

export async function mergeA11yShardReports(
  options: MergeShardOptions = {}
): Promise<A11yReport | null> {
  const inputDir = path.resolve(
    options.inputDir ?? DEFAULT_A11Y_REPORT_OUTPUT_DIR
  );
  const outputFile = path.resolve(
    options.outputFile ?? path.join(inputDir, DEFAULT_A11Y_REPORT_FILENAME)
  );
  const totalCriteria =
    options.totalCriteria ?? DEFAULT_WCAG_22_AA_CRITERIA_COUNT;

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
  const mergedReport: A11yReport = {
    report: {
      ...baseReport.report,
      reportDate: formatDate(new Date()),
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

  console.log(
    `[merge-shards] Merged ${components.length} components and ${criteria.length} criteria into ${outputFile}`
  );

  return mergedReport;
}
