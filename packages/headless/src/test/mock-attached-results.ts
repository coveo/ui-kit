import type {AttachedResult} from '../features/attached-results/attached-results-state.js';

export function createMockAttachedResult(
  config: Partial<AttachedResult> = {}
): AttachedResult {
  return {
    caseId: '12345',
    permanentId: 'permanentid',
    resultUrl: 'foo.com',
    source: 'bar',
    title: 'foo',
    ...config,
  };
}
