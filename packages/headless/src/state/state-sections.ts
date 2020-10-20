import {AdvancedSearchQueriesState} from '../features/advanced-search-queries/advanced-search-queries-slice';
import {ConfigurationState} from '../features/configuration/configuration-slice';
import {ContextState} from '../features/context/context-slice';
import {DidYouMeanState} from '../features/did-you-mean/did-you-mean-slice';
import {CategoryFacetSetState} from '../features/facets/category-facet-set/category-facet-set-slice';
import {CategoryFacetSearchSetState} from '../features/facets/facet-search-set/category/category-facet-search-set-slice';
import {SpecificFacetSearchSetState} from '../features/facets/facet-search-set/specific/specific-facet-search-set-slice';
import {FacetSetState} from '../features/facets/facet-set/facet-set-slice';
import {DateFacetSetState} from '../features/facets/range-facets/date-facet-set/date-facet-set-slice';
import {NumericFacetSetState} from '../features/facets/range-facets/numeric-facet-set/numeric-facet-set-slice';
import {FieldsState} from '../features/fields/fields-slice';
import {PaginationState} from '../features/pagination/pagination-slice';
import {QuerySetState} from '../features/query-set/query-set-slice';
import {QuerySuggestSet} from '../features/query-suggest/query-suggest-slice';
import {QueryState} from '../features/query/query-slice';
import {RedirectionState} from '../features/redirection/redirection-slice';
import {SearchState} from '../features/search/search-slice';
import {SortCriteriaState} from '../features/sort-criteria/sort-criteria-slice';

export interface QuerySection {
  /**
   * The expressions that constitute the current query.
   */
  query: QueryState;
}

export interface AdvancedSearchQueriesSection {
  /**
   * The current advanced search parameters (e.g: aq and cq)
   */
  advancedSearchQueries: AdvancedSearchQueriesState;
}

export interface FacetSection {
  /**
   * The set of facets.
   */
  facetSet: FacetSetState;
}

export interface DateFacetSection {
  /**
   * The set of date facets.
   */
  dateFacetSet: DateFacetSetState;
}

export interface NumericFacetSection {
  /**
   * The set of numeric facets.
   */
  numericFacetSet: NumericFacetSetState;
}

export interface CategoryFacetSection {
  /**
   * The set of category facets.
   */
  categoryFacetSet: CategoryFacetSetState;
}

export interface PaginationSection {
  /**
   * The properties related to pagination.
   */
  pagination: PaginationState;
}

export interface ContextSection {
  /**
   * The context to use with the search query. For more information, refer to {@link https://docs.coveo.com/en/2081/coveo-machine-learning/understanding-custom-context}
   */
  context: ContextState;
}

export interface SortSection {
  /**
   * The sort criteria to use with the search query. For more information, refer to {@link https://docs.coveo.com/en/1461/cloud-v2-developers/query-parameters#RestQueryParameters-sortCriteria}
   */
  sortCriteria: SortCriteriaState;
}

export interface QuerySetSection {
  /**
   * The set of basic query expressions.
   */
  querySet: QuerySetState;
}

export interface PipelineSection {
  /**
   * Specifies the name of the query pipeline to use for the query. If not specified, the default query pipeline will be used.
   */
  pipeline: string;
}

export interface SearchHubSection {
  /**
   * The first level of origin of the request, typically the identifier of the graphical search interface from which the request originates.
   * Coveo Machine Learning models use this information to provide contextually relevant output.
   * Notes:
   *    This parameter will be overridden if the search request is authenticated by a search token that enforces a specific searchHub.
   *    When logging a Search usage analytics event for a query, the originLevel1 field of that event should be set to the value of the searchHub search request parameter.
   */
  searchHub: string;
}

export interface ConfigurationSection {
  /**
   * The global headless engine configuration.
   */
  configuration: ConfigurationState;
}

export interface FacetSearchSection {
  /**
   * The set of facet searches.
   */
  facetSearchSet: SpecificFacetSearchSetState;
}

export interface CategoryFacetSearchSection {
  /**
   * The set of category facet searches.
   */
  categoryFacetSearchSet: CategoryFacetSearchSetState;
}

export interface RedirectionSection {
  /**
   * The URL redirection triggered by the preprocessed query.
   */
  redirection: RedirectionState;
}

export interface QuerySuggestionSection {
  /**
   * The query suggestions returned by Coveo ML.
   */
  querySuggest: QuerySuggestSet;
}

export interface SearchSection {
  /**
   * The information related to the search endpoint.
   */
  search: SearchState;
}

export interface DidYouMeanSection {
  /**
   * DidYouMean allows to retrieve query corrections from the index related to end user mispelling.
   */
  didYouMean: DidYouMeanState;
}

export interface FieldsSection {
  /**
   * The information related to fields used in the engine.
   */
  fields: FieldsState;
}
