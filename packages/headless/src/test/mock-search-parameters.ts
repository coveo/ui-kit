import {SearchParameters} from '../features/search-parameters/search-parameter-actions';

export function buildMockSearchParameters(
  config: SearchParameters = {}
): Required<SearchParameters> {
  return {
    q: '',
    enableQuerySyntax: false,
    ...config,
  };
}
