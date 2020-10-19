import {AdvancedSearchQueriesState} from '../state';

export function buildMockAdvancedSearchQueriesState(
  config: Partial<AdvancedSearchQueriesState> = {}
): AdvancedSearchQueriesState {
  return {
    aq: '',
    cq: '',
    ...config,
  };
}
