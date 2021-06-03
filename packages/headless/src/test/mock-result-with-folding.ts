import {ResultWithFolding} from '../features/folding/folding-slice';
import {buildMockResult} from './mock-result';

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
