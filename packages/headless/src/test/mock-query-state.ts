import {QueryState} from '../features/query/query-state';

export function buildMockQueryState(
  config: Partial<QueryState> = {}
): QueryState {
  return {
    q: '',
    enableQuerySyntax: false,
    ...config,
  };
}
