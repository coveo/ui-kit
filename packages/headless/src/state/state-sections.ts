import {StateWithHistory} from '../app/undoable';
import {AdvancedSearchQueriesState} from '../features/advanced-search-queries/advanced-search-queries-state';
import {AttachedResultsState} from '../features/attached-results/attached-results-state';
import {CaseAssistConfigurationState} from '../features/case-assist-configuration/case-assist-configuration-state';
import {CaseContextState} from '../features/case-context/case-context-state';
import {CaseFieldState} from '../features/case-field/case-field-state';
import {CaseInputState} from '../features/case-input/case-input-state';
import {CartState} from '../features/commerce/context/cart/cart-state';
import {CommerceContextState} from '../features/commerce/context/context-state';
import {CommerceFacetSetState} from '../features/commerce/facets/facet-set/facet-set-state';
import {CommercePaginationState} from '../features/commerce/pagination/pagination-state';
import {ProductListingV2State} from '../features/commerce/product-listing/product-listing-state';
import {CommerceQueryState} from '../features/commerce/query/query-state';
import {RecommendationsState as CommerceRecommendationsState} from '../features/commerce/recommendations/recommendations-state';
import {CommerceSearchState} from '../features/commerce/search/search-state';
import {CommerceSortState} from '../features/commerce/sort/sort-state';
import {ConfigurationState} from '../features/configuration/configuration-state';
import {ContextState} from '../features/context/context-state';
import {DictionaryFieldContextState} from '../features/dictionary-field-context/dictionary-field-context-state';
import {DidYouMeanState} from '../features/did-you-mean/did-you-mean-state';
import {DocumentSuggestionState} from '../features/document-suggestion/document-suggestion-state';
import {ExcerptLengthState} from '../features/excerpt-length/excerpt-length-state';
import {FacetOptionsState} from '../features/facet-options/facet-options-state';
import {AutomaticFacetSetState} from '../features/facets/automatic-facet-set/automatic-facet-set-state';
import {CategoryFacetSetState} from '../features/facets/category-facet-set/category-facet-set-state';
import {FacetOrderState} from '../features/facets/facet-order/facet-order-state';
import {CategoryFacetSearchSetState} from '../features/facets/facet-search-set/category/category-facet-search-set-state';
import {SpecificFacetSearchSetState} from '../features/facets/facet-search-set/specific/specific-facet-search-set-state';
import {FacetSetState} from '../features/facets/facet-set/facet-set-state';
import {DateFacetSetState} from '../features/facets/range-facets/date-facet-set/date-facet-set-state';
import {NumericFacetSetState} from '../features/facets/range-facets/numeric-facet-set/numeric-facet-set-state';
import {FieldsState} from '../features/fields/fields-state';
import {FoldingState} from '../features/folding/folding-state';
import {GeneratedAnswerState} from '../features/generated-answer/generated-answer-state';
import {HistoryState} from '../features/history/history-state';
import {InsightConfigurationState} from '../features/insight-configuration/insight-configuration-state';
import {InsightInterfaceState} from '../features/insight-interface/insight-interface-state';
import {InstantResultsState} from '../features/instant-results/instant-results-state';
import {PaginationState} from '../features/pagination/pagination-state';
import {ProductListingState} from '../features/product-listing/product-listing-state';
import {ProductRecommendationsState} from '../features/product-recommendations/product-recommendations-state';
import {QuerySetState} from '../features/query-set/query-set-state';
import {QuerySuggestSet} from '../features/query-suggest/query-suggest-state';
import {QueryState} from '../features/query/query-state';
import {QuestionAnsweringState} from '../features/question-answering/question-answering-state';
import {RecentQueriesState} from '../features/recent-queries/recent-queries-state';
import {RecentResultsState} from '../features/recent-results/recent-results-state';
import {RecommendationState} from '../features/recommendation/recommendation-state';
import {ResultPreviewState} from '../features/result-preview/result-preview-state';
import {SearchState} from '../features/search/search-state';
import {SortCriteriaState} from '../features/sort-criteria/sort-criteria-state';
import {SortState} from '../features/sort/sort-state';
import {StandaloneSearchBoxSetState} from '../features/standalone-search-box-set/standalone-search-box-set-state';
import {StaticFilterSetState} from '../features/static-filter-set/static-filter-set-state';
import {TabSetState} from '../features/tab-set/tab-set-state';
import {TriggerState} from '../features/triggers/triggers-state';

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

export interface StaticFilterSection {
  /**
   * The set of static filters.
   */
  staticFilterSet: StaticFilterSetState;
}

export interface TabSection {
  /**
   * The set of tabs.
   */
  tabSet: TabSetState;
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

export interface DictionaryFieldContextSection {
  /**
   * Holds the [dictionary field context](https://docs.coveo.com/en/2036/index-content/about-fields#dictionary-fields) information.
   */
  dictionaryFieldContext: DictionaryFieldContextState;
}

export interface SortSection {
  /**
   * The sort criteria to use with the search query. For more information, refer to {@link https://docs.coveo.com/en/13#operation/searchUsingPost-sortCriteria}
   */
  sortCriteria: SortCriteriaState;
}

export interface QuerySetSection {
  /**
   * The set of basic query expressions.
   */
  querySet: QuerySetState;
}

export interface InstantResultSection {
  /**
   * The set of results loaded for query expressions.
   */
  instantResults: InstantResultsState;
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

export interface StandaloneSearchBoxSection {
  /**
   * The set of standalone search boxes.
   */
  standaloneSearchBoxSet: StandaloneSearchBoxSetState;
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
   * DidYouMean allows to retrieve query corrections from the index related to end user misspelling.
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

export interface ProductListingSection {
  /**
   * The information related to the product listing endpoint.
   */
  productListing: ProductListingState;
}

export interface CommercePaginationSection {
  /**
   * The information related to the commerce pagination.
   */
  commercePagination: CommercePaginationState;
}

export interface CommerceSortSection {
  /**
   * The information related to the commerce sort.
   */
  commerceSort: CommerceSortState;
}

export interface CommerceContextSection {
  /**
   * The information related to the commerce context.
   */
  commerceContext: CommerceContextState;
}

export interface CommerceFacetSetSection {
  /**
   * The information related to the commerce facets.
   */
  commerceFacetSet: CommerceFacetSetState;
}

export interface CartSection {
  /**
   * The information related to the cart.
   */
  cart: CartState;
}

export interface ProductListingV2Section {
  /**
   * The information related to the product listing endpoint.
   */
  productListing: ProductListingV2State;
}

export interface RecommendationsSection {
  /**
   * The information related to the recommendations endpoint.
   */
  recommendations: CommerceRecommendationsState;
}

export interface CommerceSearchSection {
  /**
   * The information related to the commerce search endpoint.
   */
  commerceSearch: CommerceSearchState;
}

export interface CommerceQuerySection {
  /**
   * The current user query.
   */
  commerceQuery: CommerceQueryState;
}

export interface StructuredSortSection {
  /**
   * The information related to sort when using a structured sort format.
   */
  sort: SortState;
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

export interface RecentResultsSection {
  /**
   * The recent results viewed by the current user.
   */
  recentResults: RecentResultsState;
}
export interface RecentQueriesSection {
  /**
   * The recent queries executed by the current user.
   */
  recentQueries: RecentQueriesState;
}

export interface CaseAssistConfigurationSection {
  /**
   * The case assist engine configuration
   */
  caseAssistConfiguration: CaseAssistConfigurationState;
}

export interface CaseInputSection {
  /**
   * The case inputs.
   */
  caseInput: CaseInputState;
}

export interface CaseFieldSection {
  /**
   * The case fields and their predicted values.
   */
  caseField: CaseFieldState;
}

export interface DocumentSuggestionSection {
  /**
   * The document suggestions for case assist.
   */
  documentSuggestion: DocumentSuggestionState;
}

export interface ExcerptLengthSection {
  /**
   * Hold the length (in number of characters) of the excerpts generated by the indexer based on the keywords present in the query.
   * The index includes the top most interesting sentences (in the order they appear in the item) that fit in the specified number of characters.
   */
  excerptLength: ExcerptLengthState;
}

export interface InsightConfigurationSection {
  /**
   * The insight engine configuration.
   */
  insightConfiguration: InsightConfigurationState;
}

export interface InsightInterfaceSection {
  /**
   * The insight interface.
   */
  insightInterface: InsightInterfaceState;
}

export interface InsightCaseContextSection {
  /**
   * The insight case context to use with the insight search query.
   */
  insightCaseContext: CaseContextState;
}

export interface AttachedResultsSection {
  /**
   * The properties related to pagination.
   */
  attachedResults: AttachedResultsState;
}

export interface AutomaticFacetSection {
  /**
   * The set of automatic facets.
   */
  automaticFacetSet: AutomaticFacetSetState;
}

export interface GeneratedAnswerSection {
  /**
   * The properties related to generative question answering.
   */
  generatedAnswer: GeneratedAnswerState;
}
