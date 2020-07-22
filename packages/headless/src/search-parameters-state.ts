import {FacetSetState} from './features/facets/facet-set/facet-set-slice';
import {QueryState} from './state';
import {PaginationState} from './features/pagination/pagination-slice';
import {SortCriteriaState} from './features/sort-criteria/sort-criteria-slice';
import {ContextState} from './features/context/context-slice';
import {QuerySetState} from './features/query-set/query-set-slice';

export interface SearchParametersState {
  /**
   * The set of facets.
   */
  facetSet: FacetSetState;
  /**
   * The expressions that constitute the current query.
   */
  query: QueryState;
  /**
   * The properties related to pagination.
   */
  pagination: PaginationState;
  /**
   * The sort criteria to use with the search query. For more information, refer to {@link https://docs.coveo.com/en/1461/cloud-v2-developers/query-parameters#RestQueryParameters-sortCriteria}
   */
  sortCriteria: SortCriteriaState;
  /**
   * The context to use with the search query. For more information, refer to {@link https://docs.coveo.com/en/2081/coveo-machine-learning/understanding-custom-context}
   */
  context: ContextState;
  /**
   * The set of basic query expressions.
   */
  querySet: QuerySetState;
  /**
   * Specifies the name of the query pipeline to use for the query. If not specified, the default query pipeline will be used.
   */
  pipeline: string;
}
