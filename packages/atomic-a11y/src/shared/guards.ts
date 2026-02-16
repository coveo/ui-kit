import type {A11yReport} from './types.js';

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isA11yReport(value: unknown): value is A11yReport {
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
