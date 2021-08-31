import {SearchParameters} from '../features/search-parameters/search-parameter-actions';

export function buildMockSearchParameters(
  config: SearchParameters = {}
): Required<SearchParameters> {
  return {
    q: '',
    enableQuerySyntax: false,
    aq: '',
    cq: '',
    lq: '',
    firstResult: 0,
    numberOfResults: 0,
    sortCriteria: '',
    f: {},
    cf: {},
    nf: {},
    df: {},
    debug: false,
    ...config,
  };
}
