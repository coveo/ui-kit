import type {QueryState} from '../features/query/query-state.js';

export function buildMockQueryState(
  config: Partial<QueryState> = {}
): QueryState {
  return {
    q: '',
    enableQuerySyntax: false,
    ...config,
  };
}
