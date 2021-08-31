import {SearchParameters} from '../../controllers';
import {SearchParametersState} from '../../state/search-app-state';
import {getAdvancedSearchQueriesInitialState} from '../advanced-search-queries/advanced-search-queries-state';
import {getDebugInitialState} from '../debug/debug-state';
import {getPaginationInitialState} from '../pagination/pagination-state';
import {getQueryInitialState} from '../query/query-state';
import {getSortCriteriaInitialState} from '../sort-criteria/sort-criteria-state';

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
    numberOfResults: getPaginationInitialState().numberOfResults,
    sortCriteria: getSortCriteriaInitialState(),
    f: {},
    cf: {},
    nf: {},
    df: {},
    debug: getDebugInitialState(),
  };
}
