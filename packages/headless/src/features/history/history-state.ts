import {SearchParametersState} from '../../state/search-app-state';
import {getAdvancedSearchQueriesInitialState} from '../advanced-search-queries/advanced-search-queries-state';
import {getContextInitialState} from '../context/context-state';
import {getDebugInitialState} from '../debug/debug-state';
import {getDictionaryFieldContextInitialState} from '../dictionary-field-context/dictionary-field-context-state';
import {getFacetOptionsInitialState} from '../facet-options/facet-options-state';
import {getAutomaticFacetSetInitialState} from '../facets/automatic-facet-set/automatic-facet-set-state';
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
import {getStaticFilterSetInitialState} from '../static-filter-set/static-filter-set-state';
import {getTabSetInitialState} from '../tab-set/tab-set-state';

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
