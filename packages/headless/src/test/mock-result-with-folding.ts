import {ResultWithFolding} from '../features/folding/folding-slice.js';
import {buildMockResult} from './mock-result.js';

export function buildMockResultWithFolding(
  config: Partial<ResultWithFolding> = {}
): ResultWithFolding {
  return {
    ...buildMockResult(config),
    parentResult: null,
    childResults: [],
    ...config,
  };
}
