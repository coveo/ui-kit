import {readdir, readFile} from 'node:fs/promises';
import path from 'node:path';
import {BASELINE_FILE_PATTERN} from '../shared/constants.js';
import {isRecord} from '../shared/guards.js';
import type {
  ManualAuditAggregate,
  ManualAuditBaselineEntry,
  OpenAcrConformance,
} from './types.js';
import {manualStatusToConformance} from './types.js';

export interface ManualConformanceCounts {
  pass: number;
  fail: number;
  partial: number;
  notApplicable: number;
}

export function countManualConformances(
  aggregates: ManualAuditAggregate[]
): ManualConformanceCounts {
  let pass = 0;
  let fail = 0;
  let partial = 0;
  let notApplicable = 0;

  for (const aggregate of aggregates) {
    switch (aggregate.conformance) {
      case 'supports':
        pass++;
        break;
      case 'does-not-support':
        fail++;
        break;
      case 'partially-supports':
        partial++;
        break;
      case 'not-applicable':
        notApplicable++;
        break;
    }
  }

  return {pass, fail, partial, notApplicable};
}
const LOG_PREFIX = '[json-to-openacr]';
const BASELINE_FILE_PREFIX = 'manual-audit-';
const BASELINE_FILE_EXTENSION = '.json';

const CRITERION_KEY_REGEX = /^(\d+(?:\.\d+)+)-/;

export function isValidManualBaselineEntry(
  entry: unknown
): entry is ManualAuditBaselineEntry {
  return (
    isRecord(entry) &&
    typeof entry.name === 'string' &&
    entry.name.length > 0 &&
    isRecord(entry.manual) &&
    typeof entry.manual.status === 'string' &&
    isRecord(entry.manual.wcag22Criteria)
  );
}

export function parseManualBaseline(
  content: string,
  filePath: string
): Map<string, ManualAuditAggregate[]> {
  const aggregates = new Map<string, ManualAuditAggregate[]>();

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    console.warn(
      LOG_PREFIX,
      `Unable to parse manual baseline file ${filePath} as JSON.`
    );
    return aggregates;
  }

  if (!Array.isArray(parsed)) {
    console.warn(
      LOG_PREFIX,
      `Manual baseline file ${filePath} does not contain a valid array of entries.`
    );
    return aggregates;
  }

  for (const entry of parsed) {
    if (!isValidManualBaselineEntry(entry)) {
      console.warn(
        LOG_PREFIX,
        `Skipping invalid manual baseline entry:`,
        entry
      );
      continue;
    }

    if (entry.manual.status !== 'complete') {
      continue;
    }

    for (const [criterionKey, statusValue] of Object.entries(
      entry.manual.wcag22Criteria
    )) {
      if (typeof statusValue !== 'string') {
        continue;
      }

      const match = criterionKey.match(CRITERION_KEY_REGEX);
      if (!match) {
        continue;
      }

      const criterionId = match[1];
      const conformance = manualStatusToConformance[statusValue];

      if (!conformance) {
        console.warn(
          LOG_PREFIX,
          `Unknown manual status "${statusValue}" for criterion ${criterionId} in component ${entry.name}.`
        );
        continue;
      }

      const aggregate: ManualAuditAggregate = {
        componentName: entry.name,
        criterionId,
        conformance,
      };

      const key = `${entry.name}:${criterionId}`;
      const existing = aggregates.get(key) ?? [];
      aggregates.set(key, [...existing, aggregate]);
    }
  }

  return aggregates;
}

export async function loadManualAuditData(
  dirPath: string
): Promise<Map<string, ManualAuditAggregate[]>> {
  const allAggregates = new Map<string, ManualAuditAggregate[]>();
  let loadedCount = 0;
  let fileCount = 0;
  let baselineFiles: string[] = [];

  try {
    const files = await readdir(dirPath);
    baselineFiles = files.filter((file) => BASELINE_FILE_PATTERN.test(file));
    fileCount = baselineFiles.length;

    for (const file of baselineFiles) {
      const filePath = path.join(dirPath, file);
      try {
        const content = await readFile(filePath, 'utf8');
        const aggregates = parseManualBaseline(content, filePath);

        for (const [key, entries] of aggregates) {
          const existing = allAggregates.get(key) ?? [];
          allAggregates.set(key, [...existing, ...entries]);
          loadedCount += entries.length;
        }
      } catch (error) {
        console.warn(
          LOG_PREFIX,
          `Unable to read manual baseline file ${filePath}.`,
          error
        );
      }
    }
  } catch (error) {
    const errorCode =
      isRecord(error) && typeof error.code === 'string'
        ? error.code
        : undefined;

    if (errorCode === 'ENOENT') {
      return new Map();
    }

    console.warn(
      LOG_PREFIX,
      `Unable to read manual audit directory ${dirPath}.`,
      error
    );
    return new Map();
  }

  if (loadedCount > 0) {
    const criteriaSet = new Set<string>();
    for (const key of allAggregates.keys()) {
      const [, criterionId] = key.split(':');
      criteriaSet.add(criterionId);
    }
    const baselineNames = baselineFiles
      .map((file) => file.replace(BASELINE_FILE_PREFIX, ''))
      .map((file) =>
        file.endsWith(BASELINE_FILE_EXTENSION)
          ? file.slice(0, -BASELINE_FILE_EXTENSION.length)
          : file
      )
      .filter(Boolean);
    const baselineList = baselineNames.join(', ');
    console.log(
      LOG_PREFIX,
      `Loaded ${loadedCount} manual audit entries across ${criteriaSet.size} criteria from ${fileCount} baseline file(s): ${baselineList}.`
    );
  }

  return allAggregates;
}

export function resolveManualConformance(
  manualAggregates: ManualAuditAggregate[] | undefined
): OpenAcrConformance | undefined {
  if (!manualAggregates || manualAggregates.length === 0) {
    return undefined;
  }

  const {fail, partial, pass, notApplicable} =
    countManualConformances(manualAggregates);

  if (fail > 0) return 'does-not-support';
  if (partial > 0) return 'partially-supports';
  if (pass > 0) return 'supports';
  if (notApplicable > 0) return 'not-applicable';

  return undefined;
}
