import type {SearchParametersState} from '../../state/search-app-state.js';
import {getAdvancedSearchQueriesInitialState} from '../advanced-search-queries/advanced-search-queries-state.js';
import {getContextInitialState} from '../context/context-state.js';
import {getDebugInitialState} from '../debug/debug-state.js';
import {getDictionaryFieldContextInitialState} from '../dictionary-field-context/dictionary-field-context-state.js';
import {getFacetOptionsInitialState} from '../facet-options/facet-options-state.js';
import {getAutomaticFacetSetInitialState} from '../facets/automatic-facet-set/automatic-facet-set-state.js';
import {getCategoryFacetSetInitialState} from '../facets/category-facet-set/category-facet-set-state.js';
import {getFacetOrderInitialState} from '../facets/facet-order/facet-order-state.js';
import {getFacetSetInitialState} from '../facets/facet-set/facet-set-state.js';
import {getDateFacetSetInitialState} from '../facets/range-facets/date-facet-set/date-facet-set-state.js';
import {getNumericFacetSetInitialState} from '../facets/range-facets/numeric-facet-set/numeric-facet-set-state.js';
import {getPaginationInitialState} from '../pagination/pagination-state.js';
import {getPipelineInitialState} from '../pipeline/pipeline-state.js';
import {getQueryInitialState} from '../query/query-state.js';
import {getQuerySetInitialState} from '../query-set/query-set-state.js';
import {getSearchHubInitialState} from '../search-hub/search-hub-state.js';
import {getSortCriteriaInitialState} from '../sort-criteria/sort-criteria-state.js';
import {getStaticFilterSetInitialState} from '../static-filter-set/static-filter-set-state.js';
import {getTabSetInitialState} from '../tab-set/tab-set-state.js';

export interface HistoryState extends SearchParametersState {
  facetOrder: string[];
}

export function getHistoryInitialState(): HistoryState {
  return extractHistory({});
}

export function extractHistory(state: Partial<HistoryState>): HistoryState {
  return {
    context: state.context || getContextInitialState(),
    dictionaryFieldContext:
      state.dictionaryFieldContext || getDictionaryFieldContextInitialState(),
    facetSet: state.facetSet || getFacetSetInitialState(),
    numericFacetSet: state.numericFacetSet || getNumericFacetSetInitialState(),
    dateFacetSet: state.dateFacetSet || getDateFacetSetInitialState(),
    categoryFacetSet:
      state.categoryFacetSet || getCategoryFacetSetInitialState(),
    automaticFacetSet:
      state.automaticFacetSet ?? getAutomaticFacetSetInitialState(),
    pagination: state.pagination || getPaginationInitialState(),
    query: state.query || getQueryInitialState(),
    tabSet: state.tabSet || getTabSetInitialState(),
    advancedSearchQueries:
      state.advancedSearchQueries || getAdvancedSearchQueriesInitialState(),
    staticFilterSet: state.staticFilterSet || getStaticFilterSetInitialState(),
    querySet: state.querySet || getQuerySetInitialState(),
    sortCriteria: state.sortCriteria || getSortCriteriaInitialState(),
    pipeline: state.pipeline || getPipelineInitialState(),
    searchHub: state.searchHub || getSearchHubInitialState(),
    facetOptions: state.facetOptions || getFacetOptionsInitialState(),
    facetOrder: state.facetOrder ?? getFacetOrderInitialState(),
    debug: state.debug ?? getDebugInitialState(),
  };
}
