import {readdir, readFile} from 'node:fs/promises';
import path from 'node:path';
import {isKnownCriterion} from '../data/criterion-metadata.js';
import {BASELINE_FILE_PATTERN} from '../shared/constants.js';
import {isRecord} from '../shared/guards.js';
import type {ManualAuditAggregate, ManualAuditFile, OpenAcrConformance} from './types.js';
import {CONFORMANCE_SEVERITY, manualStatusToConformance} from './types.js';

const LOG_PREFIX = '[json-to-openacr]';
const CRITERION_KEY_REGEX = /^(\d+(?:\.\d+)+)-/;

function isValidManualAuditFile(value: unknown): value is ManualAuditFile {
  return (
    isRecord(value) &&
    isRecord(value.wcag22Criteria) &&
    (value.surface === undefined || typeof value.surface === 'string')
  );
}

function extractCriterionStatus(statusValue: unknown): {status: string; remarks?: string} | null {
  if (typeof statusValue === 'string') {
    return {status: statusValue};
  }

  if (isRecord(statusValue)) {
    if (typeof statusValue.conformance !== 'string') {
      return null;
    }
    return {
      status: statusValue.conformance,
      remarks: typeof statusValue.remarks === 'string' ? statusValue.remarks : undefined,
    };
  }

  return null;
}

function parseCriterionEntry(
  criterionKey: string,
  statusValue: unknown,
  context: string
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

  if (!isKnownCriterion(criterionId)) {
    console.warn(
      LOG_PREFIX,
      `Unknown WCAG criterion "${criterionId}" (from key "${criterionKey}") in ${context}.`
    );
    return null;
  }

  const conformance = manualStatusToConformance[extracted.status];

  if (!conformance) {
    console.warn(
      LOG_PREFIX,
      `Unknown manual status "${extracted.status}" for criterion ${criterionId} in ${context}.`
    );
    return null;
  }

  return {
    criterionId,
    conformance,
    ...(extracted.remarks && {remarks: extracted.remarks}),
  };
}

function collectFileAggregates(
  file: ManualAuditFile,
  context: string,
  aggregates: Map<string, ManualAuditAggregate[]>
): number {
  let count = 0;

  for (const [criterionKey, statusValue] of Object.entries(file.wcag22Criteria)) {
    const aggregate = parseCriterionEntry(criterionKey, statusValue, context);
    if (!aggregate) {
      continue;
    }

    const existing = aggregates.get(aggregate.criterionId) ?? [];
    aggregates.set(aggregate.criterionId, [...existing, aggregate]);
    count++;
  }

  return count;
}

function parseManualFile(content: string, filePath: string): ManualAuditFile | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    console.warn(LOG_PREFIX, `Unable to parse manual audit file ${filePath} as JSON.`);
    return null;
  }

  if (!isValidManualAuditFile(parsed)) {
    console.warn(
      LOG_PREFIX,
      `Manual audit file ${filePath} must be an object with a "wcag22Criteria" map.`
    );
    return null;
  }

  return parsed;
}

async function loadFileNames(dirPath: string): Promise<string[] | null> {
  try {
    const files = await readdir(dirPath);
    return files.filter((file) => BASELINE_FILE_PATTERN.test(file));
  } catch (error) {
    const errorCode = isRecord(error) && typeof error.code === 'string' ? error.code : undefined;

    if (errorCode === 'ENOENT') {
      return null;
    }

    console.warn(LOG_PREFIX, `Unable to read manual audit directory ${dirPath}.`, error);
    return null;
  }
}

/**
 * Loads every `manual-audit-*.json` file in `dirPath` and returns the audited
 * results indexed by WCAG criterion id. Each file is one surface-scoped record;
 * the surface label is organizational only. Files contribute independently —
 * the same criterion may appear in several files, and worst-wins resolution is
 * applied later across all of them plus the automated/interactive signals.
 */
export async function loadManualAuditData(
  dirPath: string
): Promise<Map<string, ManualAuditAggregate[]>> {
  const aggregates = new Map<string, ManualAuditAggregate[]>();

  const files = await loadFileNames(dirPath);
  if (!files) {
    return aggregates;
  }

  let loadedCount = 0;
  const loadedLabels: string[] = [];

  for (const file of files) {
    const filePath = path.join(dirPath, file);

    let content: string;
    try {
      content = await readFile(filePath, 'utf8');
    } catch (error) {
      console.warn(LOG_PREFIX, `Unable to read manual audit file ${filePath}.`, error);
      continue;
    }

    const parsed = parseManualFile(content, filePath);
    if (!parsed) {
      continue;
    }

    const context = parsed.surface ?? file;
    loadedCount += collectFileAggregates(parsed, context, aggregates);
    loadedLabels.push(context);
  }

  if (loadedCount > 0) {
    console.log(
      LOG_PREFIX,
      `Loaded ${loadedCount} manual audit result(s) across ${aggregates.size} criteria from ${loadedLabels.length} file(s): ${loadedLabels.join(', ')}.`
    );
  }

  return aggregates;
}

/**
 * Worst-wins conformance across a criterion's manual results
 * (does-not-support > partially-supports > supports > not-applicable).
 * Returns `undefined` when there are no manual results.
 */
export function resolveManualConformance(
  manualAggregates?: ManualAuditAggregate[]
): OpenAcrConformance | undefined {
  if (!manualAggregates || manualAggregates.length === 0) {
    return undefined;
  }

  let worst: OpenAcrConformance | undefined;
  for (const aggregate of manualAggregates) {
    if (
      worst === undefined ||
      CONFORMANCE_SEVERITY[aggregate.conformance] > CONFORMANCE_SEVERITY[worst]
    ) {
      worst = aggregate.conformance;
    }
  }

  return worst;
}
