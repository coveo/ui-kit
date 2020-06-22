import {SearchPageState} from '../state';
import {getConfigurationInitialState} from '../features/configuration/configuration-slice';
import {getQueryInitialState} from '../features/query/query-slice';
import {getRedirectionInitialState} from '../features/redirection/redirection-slice';
import {getQuerySetInitialState} from '../features/query-set/query-set-slice';
import {getSearchInitialState} from '../features/search/search-slice';
import {getPaginationInitialState} from '../features/pagination/pagination-slice';
import {getSortCriteriaInitialState} from '../features/sort-criteria/sort-criteria-slice';
import {getFacetSetInitialState} from '../features/facets/facet-set/facet-set-slice';

export function createMockState(
  config: Partial<SearchPageState> = {}
): SearchPageState {
  return {
    configuration: getConfigurationInitialState(),
    facetSet: getFacetSetInitialState(),
    pagination: getPaginationInitialState(),
    query: getQueryInitialState(),
    querySet: getQuerySetInitialState(),
    querySuggest: {},
    redirection: getRedirectionInitialState(),
    search: getSearchInitialState(),
    sortCriteria: getSortCriteriaInitialState(),
    ...config,
  };
}
