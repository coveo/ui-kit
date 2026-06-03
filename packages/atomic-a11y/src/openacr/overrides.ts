import {readFile} from 'node:fs/promises';
import {isRecord} from '../shared/guards.js';
import type {A11yOverrideEntry, OpenAcrConformance} from './types.js';
import {VALID_OVERRIDE_CONFORMANCE_VALUES} from './types.js';

const LOG_PREFIX = '[json-to-openacr]';

function isValidOverrideEntry(entry: unknown): entry is A11yOverrideEntry {
  if (!isRecord(entry)) {
    return false;
  }

  return (
    typeof entry.criterion === 'string' &&
    typeof entry.conformance === 'string' &&
    VALID_OVERRIDE_CONFORMANCE_VALUES.has(
      entry.conformance as OpenAcrConformance
    ) &&
    typeof entry.reason === 'string' &&
    entry.reason.length > 0
  );
}

function parseOverrides(
  content: string,
  filePath: string
): Map<string, A11yOverrideEntry> {
  const overrides = new Map<string, A11yOverrideEntry>();

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    console.warn(
      LOG_PREFIX,
      `Unable to parse overrides file ${filePath} as JSON.`
    );
    return overrides;
  }

  if (!isRecord(parsed) || !Array.isArray(parsed.overrides)) {
    console.warn(
      LOG_PREFIX,
      `Overrides file ${filePath} does not contain a valid "overrides" array.`
    );
    return overrides;
  }

  for (const entry of parsed.overrides) {
    if (!isValidOverrideEntry(entry)) {
      console.warn(LOG_PREFIX, `Skipping invalid override entry:`, entry);
      continue;
    }

    overrides.set(entry.criterion, entry);
  }

  return overrides;
}

export async function loadOverrides(
  filePath: string
): Promise<Map<string, A11yOverrideEntry>> {
  try {
    const content = await readFile(filePath, 'utf8');
    return parseOverrides(content, filePath);
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
      `Unable to read overrides file ${filePath}.`,
      error
    );
    return new Map();
  }
}
