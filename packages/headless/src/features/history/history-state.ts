import {SearchParametersState} from '../../state/search-app-state';
import {getAdvancedSearchQueriesInitialState} from '../advanced-search-queries/advanced-search-queries-state';
import {getContextInitialState} from '../context/context-state';
import {getDebugInitialState} from '../debug/debug-state';
import {getFacetOptionsInitialState} from '../facet-options/facet-options-state';
import {getCategoryFacetSetInitialState} from '../facets/category-facet-set/category-facet-set-state';
import {getFacetOrderInitialState} from '../facets/facet-order/facet-order-state';
import {getFacetSetInitialState} from '../facets/facet-set/facet-set-state';
import {getDateFacetSetInitialState} from '../facets/range-facets/date-facet-set/date-facet-set-state';
import {getNumericFacetSetInitialState} from '../facets/range-facets/numeric-facet-set/numeric-facet-set-state';
import {getPaginationInitialState} from '../pagination/pagination-state';
import {getPipelineInitialState} from '../pipeline/pipeline-state';
import {getQuerySetInitialState} from '../query-set/query-set-state';
import {getQueryInitialState} from '../query/query-state';
import {getSearchHubInitialState} from '../search-hub/search-hub-state';
import {getSortCriteriaInitialState} from '../sort-criteria/sort-criteria-state';

export interface HistoryState extends SearchParametersState {
  facetOrder: string[];
}

export function getHistoryInitialState(): HistoryState {
  return {
    context: getContextInitialState(),
    facetSet: getFacetSetInitialState(),
    numericFacetSet: getNumericFacetSetInitialState(),
    dateFacetSet: getDateFacetSetInitialState(),
    categoryFacetSet: getCategoryFacetSetInitialState(),
    pagination: getPaginationInitialState(),
    query: getQueryInitialState(),
    advancedSearchQueries: getAdvancedSearchQueriesInitialState(),
    querySet: getQuerySetInitialState(),
    sortCriteria: getSortCriteriaInitialState(),
    pipeline: getPipelineInitialState(),
    searchHub: getSearchHubInitialState(),
    facetOptions: getFacetOptionsInitialState(),
    facetOrder: getFacetOrderInitialState(),
    debug: getDebugInitialState(),
  };
}

export function extractHistory(state: Partial<HistoryState>): HistoryState {
  return {
    ...getHistoryInitialState(),
    ...state,
  };
}
