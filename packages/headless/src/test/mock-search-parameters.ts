import type {SearchParameters} from '../features/search-parameters/search-parameter-actions.js';

export function buildMockSearchParameters(
  config: SearchParameters = {}
): Required<Omit<SearchParameters, 'mnf'>> {
  return {
    q: '',
    enableQuerySyntax: false,
    aq: '',
    cq: '',
    firstResult: 0,
    numberOfResults: 0,
    sortCriteria: '',
    f: {},
    fExcluded: {},
    cf: {},
    nf: {},
    df: {},
    debug: false,
    sf: {},
    tab: '',
    af: {},
    ...config,
  };
}
