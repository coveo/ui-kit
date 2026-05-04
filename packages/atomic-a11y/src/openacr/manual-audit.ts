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

interface ManualConformanceCounts {
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

function isValidManualBaselineEntry(
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

function extractCriterionStatus(
  statusValue: unknown
): {status: string; remarks?: string} | null {
  if (typeof statusValue === 'string') {
    return {status: statusValue};
  }

  if (isRecord(statusValue)) {
    if (typeof statusValue.conformance !== 'string') {
      return null;
    }
    return {
      status: statusValue.conformance,
      remarks:
        typeof statusValue.remarks === 'string'
          ? statusValue.remarks
          : undefined,
    };
  }

  return null;
}

function parseCriterionEntry(
  criterionKey: string,
  statusValue: unknown,
  componentName: string
): ManualAuditAggregate | null {
  const extracted = extractCriterionStatus(statusValue);
  if (!extracted) {
    return null;
  }

  const match = criterionKey.match(CRITERION_KEY_REGEX);
  if (!match) {
    return null;
  }

  const criterionId = match[1];
  const conformance = manualStatusToConformance[extracted.status];

  if (!conformance) {
    console.warn(
      LOG_PREFIX,
      `Unknown manual status "${extracted.status}" for criterion ${criterionId} in component ${componentName}.`
    );
    return null;
  }

  return {
    componentName,
    criterionId,
    conformance,
    ...(extracted.remarks && {remarks: extracted.remarks}),
  };
}

function collectEntryAggregates(
  entry: ManualAuditBaselineEntry,
  aggregates: Map<string, ManualAuditAggregate[]>
): void {
  for (const [criterionKey, statusValue] of Object.entries(
    entry.manual.wcag22Criteria
  )) {
    const aggregate = parseCriterionEntry(
      criterionKey,
      statusValue,
      entry.name
    );
    if (!aggregate) {
      continue;
    }

    const key = `${entry.name}:${aggregate.criterionId}`;
    const existing = aggregates.get(key) ?? [];
    aggregates.set(key, [...existing, aggregate]);
  }
}

function parseManualBaseline(
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

    collectEntryAggregates(entry, aggregates);
  }

  return aggregates;
}

function mergeAggregates(
  target: Map<string, ManualAuditAggregate[]>,
  source: Map<string, ManualAuditAggregate[]>
): number {
  let mergedCount = 0;

  for (const [key, entries] of source) {
    const existing = target.get(key) ?? [];
    target.set(key, [...existing, ...entries]);
    mergedCount += entries.length;
  }

  return mergedCount;
}

function listBaselineFiles(files: string[]): string[] {
  return files.filter((file) => BASELINE_FILE_PATTERN.test(file));
}

function getBaselineNames(files: string[]): string[] {
  return files
    .map((file) => file.replace(BASELINE_FILE_PREFIX, ''))
    .map((file) =>
      file.endsWith(BASELINE_FILE_EXTENSION)
        ? file.slice(0, -BASELINE_FILE_EXTENSION.length)
        : file
    )
    .filter(Boolean);
}

function getUniqueCriterionCount(
  aggregates: Map<string, ManualAuditAggregate[]>
): number {
  const criteriaSet = new Set<string>();

  for (const key of aggregates.keys()) {
    const [, criterionId] = key.split(':');
    criteriaSet.add(criterionId);
  }

  return criteriaSet.size;
}

function logManualAuditSummary(
  loadedCount: number,
  baselineFiles: string[],
  aggregates: Map<string, ManualAuditAggregate[]>
): void {
  if (loadedCount <= 0) {
    return;
  }

  const criteriaCount = getUniqueCriterionCount(aggregates);
  const baselineList = getBaselineNames(baselineFiles).join(', ');

  console.log(
    LOG_PREFIX,
    `Loaded ${loadedCount} manual audit entries across ${criteriaCount} criteria from ${baselineFiles.length} baseline file(s): ${baselineList}.`
  );
}

async function readBaselineFileAggregates(
  dirPath: string,
  file: string
): Promise<Map<string, ManualAuditAggregate[]>> {
  const filePath = path.join(dirPath, file);

  try {
    const content = await readFile(filePath, 'utf8');
    return parseManualBaseline(content, filePath);
  } catch (error) {
    console.warn(
      LOG_PREFIX,
      `Unable to read manual baseline file ${filePath}.`,
      error
    );
    return new Map();
  }
}

async function loadBaselineFiles(dirPath: string): Promise<string[] | null> {
  try {
    const files = await readdir(dirPath);
    return listBaselineFiles(files);
  } catch (error) {
    const errorCode =
      isRecord(error) && typeof error.code === 'string'
        ? error.code
        : undefined;

    if (errorCode === 'ENOENT') {
      return null;
    }

    console.warn(
      LOG_PREFIX,
      `Unable to read manual audit directory ${dirPath}.`,
      error
    );
    return null;
  }
}

export async function loadManualAuditData(
  dirPath: string
): Promise<Map<string, ManualAuditAggregate[]>> {
  const allAggregates = new Map<string, ManualAuditAggregate[]>();
  let loadedCount = 0;

  const baselineFiles = await loadBaselineFiles(dirPath);
  if (!baselineFiles) {
    return allAggregates;
  }

  for (const file of baselineFiles) {
    const fileAggregates = await readBaselineFileAggregates(dirPath, file);
    loadedCount += mergeAggregates(allAggregates, fileAggregates);
  }

  logManualAuditSummary(loadedCount, baselineFiles, allAggregates);

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
