import type {A11yInteractiveResults} from './types.js';

export type EvidenceOutcome = 'passed' | 'partially-passed' | 'failed';

export function resolveEvidenceOutcome(
  passedCount: number,
  failedCount: number
): EvidenceOutcome | null {
  if (passedCount > 0 && failedCount > 0) {
    return 'partially-passed';
  }
  if (failedCount > 0) {
    return 'failed';
  }
  if (passedCount > 0) {
    return 'passed';
  }
  return null;
}

export function getInteractiveCriteriaPassed(
  results: A11yInteractiveResults
): string[] {
  if (results.criteriaPassed) {
    return results.criteriaPassed;
  }

  return results.testCount > 0 && results.passedCount === results.testCount
    ? results.criteriaCovered
    : [];
}

export function getInteractiveCriteriaFailed(
  results: A11yInteractiveResults
): string[] {
  return results.criteriaFailed ?? [];
}

export function getInteractiveCriteriaWarnings(
  results: A11yInteractiveResults
): string[] {
  return results.criteriaWarnings ?? [];
}
