import {SearchState} from '../features/search/search-slice';
import {buildMockSearchResponse} from './mock-search-response';

export function buildMockSearch(
  config: Partial<SearchState> = {}
): SearchState {
  return {
    response: buildMockSearchResponse(),
    duration: 0,
    ...config,
  };
}
