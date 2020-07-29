import {SearchPageState} from '../state';
import {getConfigurationInitialState} from '../features/configuration/configuration-slice';
import {getQueryInitialState} from '../features/query/query-slice';
import {getRedirectionInitialState} from '../features/redirection/redirection-slice';
import {getQuerySetInitialState} from '../features/query-set/query-set-slice';
import {getSearchInitialState} from '../features/search/search-slice';
import {getPaginationInitialState} from '../features/pagination/pagination-slice';
import {getSortCriteriaInitialState} from '../features/sort-criteria/sort-criteria-slice';
import {getFacetSetInitialState} from '../features/facets/facet-set/facet-set-slice';
import {getContextInitialState} from '../features/context/context-slice';
import {getDidYouMeanInitialState} from '../features/did-you-mean/did-you-mean-slice';
import {getFacetSearchSetInitialState} from '../features/facets/facet-search-set/facet-search-set-slice';
import {getFieldsInitialState} from '../features/fields/fields-slice';
import {getHistoryEmptyState} from '../features/history/history-slice';
import {getRangeFacetSetInitialState} from '../features/facets/range-facet-set/range-facet-set-slice';
import {getPipelineInitialState} from '../features/pipeline/pipeline-slice';
import {makeHistory} from '../app/undoable';

export function createMockState(
  config: Partial<SearchPageState> = {}
): SearchPageState {
  return {
    configuration: getConfigurationInitialState(),
    facetSet: getFacetSetInitialState(),
    rangeFacetSet: getRangeFacetSetInitialState(),
    facetSearchSet: getFacetSearchSetInitialState(),
    pagination: getPaginationInitialState(),
    query: getQueryInitialState(),
    querySet: getQuerySetInitialState(),
    querySuggest: {},
    redirection: getRedirectionInitialState(),
    search: getSearchInitialState(),
    sortCriteria: getSortCriteriaInitialState(),
    context: getContextInitialState(),
    didYouMean: getDidYouMeanInitialState(),
    fields: getFieldsInitialState(),
    history: makeHistory(getHistoryEmptyState()),
    pipeline: getPipelineInitialState(),
    ...config,
  };
}
