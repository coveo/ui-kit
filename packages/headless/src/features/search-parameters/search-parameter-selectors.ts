import type {SearchParametersState} from '../../state/search-app-state.js';
import {getAdvancedSearchQueriesInitialState} from '../advanced-search-queries/advanced-search-queries-state.js';
import {getDebugInitialState} from '../debug/debug-state.js';
import {getPaginationInitialState} from '../pagination/pagination-state.js';
import {getQueryInitialState} from '../query/query-state.js';
import {getSortCriteriaInitialState} from '../sort-criteria/sort-criteria-state.js';
import type {SearchParameters} from './search-parameter-actions.js';

export function initialSearchParameterSelector(
  state: Partial<SearchParametersState>
): Required<SearchParameters> {
  return {
    q: getQueryInitialState().q,
    enableQuerySyntax: getQueryInitialState().enableQuerySyntax,
    aq:
      state.advancedSearchQueries?.defaultFilters.aq ??
      getAdvancedSearchQueriesInitialState().defaultFilters.aq,
    cq:
      state.advancedSearchQueries?.defaultFilters.cq ??
      getAdvancedSearchQueriesInitialState().defaultFilters.cq,
    firstResult: getPaginationInitialState().firstResult,
    numberOfResults:
      state.pagination?.defaultNumberOfResults ??
      getPaginationInitialState().defaultNumberOfResults,
    sortCriteria: getSortCriteriaInitialState(),
    f: {},
    fExcluded: {},
    cf: {},
    nf: {},
    df: {},
    debug: getDebugInitialState(),
    sf: {},
    tab: '',
    af: {},
    mnf: {},
  };
}
