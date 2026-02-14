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
      `[json-to-openacr] Unable to parse manual baseline file ${filePath} as JSON.`
    );
    return aggregates;
  }

  if (!Array.isArray(parsed)) {
    console.warn(
      `[json-to-openacr] Manual baseline file ${filePath} does not contain a valid array of entries.`
    );
    return aggregates;
  }

  for (const entry of parsed) {
    if (!isValidManualBaselineEntry(entry)) {
      console.warn(
        `[json-to-openacr] Skipping invalid manual baseline entry:`,
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
          `[json-to-openacr] Unknown manual status "${statusValue}" for criterion ${criterionId} in component ${entry.name}.`
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

  try {
    const files = await readdir(dirPath);
    const baselineFiles = files.filter((file) =>
      BASELINE_FILE_PATTERN.test(file)
    );
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
          `[json-to-openacr] Unable to read manual baseline file ${filePath}.`,
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
      `[json-to-openacr] Unable to read manual audit directory ${dirPath}.`,
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
    console.log(
      `[json-to-openacr] Loaded ${loadedCount} manual audit entries across ${criteriaSet.size} criteria from ${fileCount} baseline file(s).`
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

  // Count conformances to apply precedence: fail > partial > pass > not-applicable
  let failCount = 0;
  let partialCount = 0;
  let passCount = 0;
  let notApplicableCount = 0;

  for (const aggregate of manualAggregates) {
    switch (aggregate.conformance) {
      case 'does-not-support':
        failCount++;
        break;
      case 'partially-supports':
        partialCount++;
        break;
      case 'supports':
        passCount++;
        break;
      case 'not-applicable':
        notApplicableCount++;
        break;
    }
  }

  // Apply resolution precedence
  if (failCount > 0) {
    return 'does-not-support';
  }
  if (partialCount > 0) {
    return 'partially-supports';
  }
  if (passCount > 0) {
    return 'supports';
  }
  if (notApplicableCount > 0) {
    return 'not-applicable';
  }

  return undefined;
}
