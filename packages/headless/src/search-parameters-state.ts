import {FacetSetState} from './features/facets/facet-set/facet-set-slice';
import {ConstantQueryState, QueryState, AdvancedQueryState} from './state';
import {PaginationState} from './features/pagination/pagination-slice';
import {SortCriteriaState} from './features/sort-criteria/sort-criteria-slice';
import {ContextState} from './features/context/context-slice';
import {QuerySetState} from './features/query-set/query-set-slice';
import {DateFacetSetState} from './features/facets/range-facets/date-facet-set/date-facet-set-slice';
import {NumericFacetSetState} from './features/facets/range-facets/numeric-facet-set/numeric-facet-set-slice';
import {CategoryFacetSetState} from './features/facets/category-facet-set/category-facet-set-slice';

export interface SearchParametersState {
  /**
   * The set of facets.
   */
  facetSet: FacetSetState;
  /**
   * The set of date facets.
   */
  dateFacetSet: DateFacetSetState;
  /**
   * The set of numeric facets.
   */
  numericFacetSet: NumericFacetSetState;
  /**
   * The set of category facets.
   */
  categoryFacetSet: CategoryFacetSetState;
  /**
   * The expressions that constitute the current query.
   */
  query: QueryState;

  /**
   * The current cq
   */
  constantQuery: ConstantQueryState;

  /**
   * The current aq
   */
  advancedQuery: AdvancedQueryState;

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
  /**
   * The first level of origin of the request, typically the identifier of the graphical search interface from which the request originates.
   * Coveo Machine Learning models use this information to provide contextually relevant output.
   * Notes:
   *    This parameter will be overridden if the search request is authenticated by a search token that enforces a specific searchHub.
   *    When logging a Search usage analytics event for a query, the originLevel1 field of that event should be set to the value of the searchHub search request parameter.
   */
  searchHub: string;
}
