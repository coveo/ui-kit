import {SearchParametersState} from '../../state/search-app-state';
import {getAdvancedSearchQueriesInitialState} from '../advanced-search-queries/advanced-search-queries-state';
import {getDebugInitialState} from '../debug/debug-state';
import {getPaginationInitialState} from '../pagination/pagination-state';
import {getQueryInitialState} from '../query/query-state';
import {getSortCriteriaInitialState} from '../sort-criteria/sort-criteria-state';
import {SearchParameters} from './search-parameter-actions';

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
  };
}
