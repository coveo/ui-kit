import {AdvancedSearchQueriesState} from '../features/advanced-search-queries/advanced-search-queries-state';
import {ConfigurationState} from '../features/configuration/configuration-state';
import {ContextState} from '../features/context/context-state';
import {DidYouMeanState} from '../features/did-you-mean/did-you-mean-state';
import {FacetOptionsState} from '../features/facet-options/facet-options-state';
import {CategoryFacetSetState} from '../features/facets/category-facet-set/category-facet-set-state';
import {CategoryFacetSearchSetState} from '../features/facets/facet-search-set/category/category-facet-search-set-state';
import {SpecificFacetSearchSetState} from '../features/facets/facet-search-set/specific/specific-facet-search-set-state';
import {FacetSetState} from '../features/facets/facet-set/facet-set-state';
import {DateFacetSetState} from '../features/facets/range-facets/date-facet-set/date-facet-set-state';
import {NumericFacetSetState} from '../features/facets/range-facets/numeric-facet-set/numeric-facet-set-state';
import {FieldsState} from '../features/fields/fields-state';
import {ProductRecommendationsState} from '../features/product-recommendations/product-recommendations-state';
import {PaginationState} from '../features/pagination/pagination-state';
import {QuerySetState} from '../features/query-set/query-set-state';
import {QuerySuggestSet} from '../features/query-suggest/query-suggest-state';
import {QueryState} from '../features/query/query-state';
import {RecommendationState} from '../features/recommendation/recommendation-state';
import {RedirectionState} from '../features/redirection/redirection-state';
import {SearchState} from '../features/search/search-state';
import {SortCriteriaState} from '../features/sort-criteria/sort-criteria-state';
import {FacetOrderState} from '../features/facets/facet-order/facet-order-state';
import {ResultPreviewState} from '../features/result-preview/result-preview-state';
import {StateWithHistory} from '../app/undoable';
import {HistoryState} from '../features/history/history-state';
import {FoldingState} from '../features/folding/folding-state';
import {TriggerState} from '../features/triggers/triggers-state';
import {QuestionAnsweringState} from '../features/question-answering/question-answering-state';

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

export interface FacetOptionsSection {
  /** The properties related to reordering facets. */
  facetOptions: FacetOptionsState;
}

export interface PaginationSection {
  /**
   * The properties related to pagination.
   */
  pagination: PaginationState;
}

export interface ResultPreviewSection {
  /**
   * The properties related to the previewed result.
   */
  resultPreview: ResultPreviewState;
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

export interface DebugSection {
  /**
   * Specifies if debug information should be fetched.
   */
  debug: boolean;
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

export interface FoldingSection {
  /**
   * The information needed to fold results into collections.
   */
  folding: FoldingState;
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

export interface FacetOrderSection {
  /**
   * The order of facets.
   */
  facetOrder: FacetOrderState;
}

export interface HistorySection {
  /**
   * The snapshots of state.
   */
  history: StateWithHistory<HistoryState>;
}

export interface VersionSection {
  /**
   * The current version of headless.
   */
  version: string;
}

export interface RecommendationSection {
  /**
   * The information related to the recommendation endpoint.
   */
  recommendation: RecommendationState;
}

export interface ProductRecommendationsSection {
  /**
   * The information related to the product recommendations endpoint.
   */
  productRecommendations: ProductRecommendationsState;
}

export interface TriggerSection {
  /**
   * The information related to the triggers.
   */
  triggers: TriggerState;
}

export interface QuestionAnsweringSection {
  /**
   * The question and answers for a given query, also known as smart snippet.
   */
  questionAnswering: QuestionAnsweringState;
}
