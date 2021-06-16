export {Controller, buildController} from './controller/headless-controller';

export {
  RelevanceInspectorInitialState,
  RelevanceInspectorOptions,
  RelevanceInspectorProps,
  RelevanceInspectorState,
  RelevanceInspector,
  DocumentWeights,
  ExecutionReport,
  ExecutionStep,
  QueryExpressions,
  QueryRankingExpressionWeights,
  QueryRankingExpression,
  ResultRankingInformation,
  RankingInformation,
  TermWeightReport,
  SecurityIdentity,
  buildRelevanceInspector,
} from './relevance-inspector/headless-relevance-inspector';

export {
  Context,
  ContextState,
  ContextValue,
  ContextPayload,
  buildContext,
} from './context/headless-context';

export {
  DidYouMean,
  DidYouMeanState,
  QueryCorrection,
  WordCorrection,
  buildDidYouMean,
} from './did-you-mean/headless-did-you-mean';

export {
  CategoryFacetOptions,
  CategoryFacetSearchOptions,
  CategoryFacetProps,
  CategoryFacetState,
  CategoryFacet,
  buildCategoryFacet,
  CategoryFacetValue,
  CategoryFacetSearch,
  CategoryFacetSearchState,
  CategoryFacetSearchResult,
} from './facets/category-facet/headless-category-facet';

export {
  FacetOptions,
  FacetSearchOptions,
  FacetProps,
  FacetState,
  Facet,
  buildFacet,
  FacetValue,
  FacetValueState,
  FacetSearch,
  FacetSearchState,
  SpecificFacetSearchResult,
} from './facets/facet/headless-facet';

export {
  DateRangeOptions,
  DateRangeRequest,
  DateRangeInput,
  buildDateRange,
  DateFacetOptions,
  DateFacetProps,
  DateFacetState,
  DateFacet,
  buildDateFacet,
} from './facets/range-facet/date-facet/headless-date-facet';

export {
  buildNumericRange,
  NumericRangeOptions,
  NumericRangeRequest,
  buildNumericFacet,
  NumericFacetOptions,
  NumericFacetProps,
  NumericFacetState,
  NumericFacet,
} from './facets/range-facet/numeric-facet/headless-numeric-facet';

export {
  History,
  HistoryState,
  buildHistory,
} from './history-manager/headless-history';

export {
  HistoryManager,
  HistoryManagerState,
  buildHistoryManager,
} from './history-manager/headless-history-manager';

export {
  PagerInitialState,
  PagerOptions,
  PagerProps,
  PagerState,
  Pager,
  buildPager,
} from './pager/headless-pager';

export {
  QueryError,
  QueryErrorState,
  buildQueryError,
} from './query-error/headless-query-error';

export {
  QuerySummaryState,
  QuerySummary,
  buildQuerySummary,
} from './query-summary/headless-query-summary';

export {
  ResultListProps,
  ResultListOptions,
  ResultListState,
  ResultList,
  buildResultList,
} from './result-list/headless-result-list';

export {
  InteractiveResultOptions,
  InteractiveResultProps,
  InteractiveResult,
  buildInteractiveResult,
} from './result-list/headless-interactive-result';

export {
  ResultsPerPageInitialState,
  ResultsPerPageProps,
  ResultsPerPageState,
  ResultsPerPage,
  buildResultsPerPage,
} from './results-per-page/headless-results-per-page';

export {
  SearchBoxOptions,
  SearchBoxProps,
  SearchBoxState,
  SearchBox,
  Suggestion,
  SuggestionHighlightingOptions,
  Delimiters,
  buildSearchBox,
} from './search-box/headless-search-box';

export {
  SortInitialState,
  SortProps,
  SortState,
  Sort,
  buildSort,
} from './sort/headless-sort';

export {
  TabInitialState,
  TabOptions,
  TabProps,
  TabState,
  Tab,
  buildTab,
} from './tab/headless-tab';

export {
  FacetManagerPayload,
  FacetManagerState,
  FacetManager,
  buildFacetManager,
} from './facet-manager/headless-facet-manager';

export {
  NumericFacetBreadcrumb,
  FacetBreadcrumb,
  DateFacetBreadcrumb,
  CategoryFacetBreadcrumb,
  Breadcrumb,
  BreadcrumbValue,
  BreadcrumbManagerState,
  BreadcrumbManager,
  buildBreadcrumbManager,
} from './breadcrumb-manager/headless-breadcrumb-manager';

export {
  /**
   * @deprecated - The interface is moving to a dedicated sub-package. Please access it using "import {...} from '@coveo/headless/recommendation'".
   */
  RecommendationListOptions,
  /**
   * @deprecated - The interface is moving to a dedicated sub-package. Please access it using "import {...} from '@coveo/headless/recommendation'".
   */
  RecommendationListProps,
  /**
   * @deprecated - The interface is moving to a dedicated sub-package. Please access it using "import {...} from '@coveo/headless/recommendation'".
   */
  RecommendationListState,
  /**
   * @deprecated - The interface is moving to a dedicated sub-package. Please access it using "import {...} from '@coveo/headless/recommendation'".
   */
  RecommendationList,
  /**
   * @deprecated - The function is moving to a dedicated sub-package. Please access it using "import {...} from '@coveo/headless/recommendation'".
   */
  buildRecommendationList,
} from './recommendation/headless-recommendation';

export {
  StandaloneSearchBoxOptions,
  StandaloneSearchBoxProps,
  StandaloneSearchBoxState,
  StandaloneSearchBox,
  buildStandaloneSearchBox,
} from './standalone-search-box/headless-standalone-search-box';

export {
  /**
   * @deprecated - The interface is moving to a dedicated sub-package. Please access it using "import {...} from '@coveo/headless/product-recommendation'".
   */
  FrequentlyBoughtTogetherListOptions,
  /**
   * @deprecated - The interface is moving to a dedicated sub-package. Please access it using "import {...} from '@coveo/headless/product-recommendation'".
   */
  FrequentlyBoughtTogetherListProps,
  /**
   * @deprecated - The interface is moving to a dedicated sub-package. Please access it using "import {...} from '@coveo/headless/product-recommendation'".
   */
  FrequentlyBoughtTogetherListState,
  /**
   * @deprecated - The interface is moving to a dedicated sub-package. Please access it using "import {...} from '@coveo/headless/product-recommendation'".
   */
  FrequentlyBoughtTogetherList,
  /**
   * @deprecated - The function is moving to a dedicated sub-package. Please access it using "import {...} from '@coveo/headless/product-recommendation'".
   */
  buildFrequentlyBoughtTogetherList,
} from './product-recommendations/headless-frequently-bought-together';

export {
  /**
   * @deprecated - The interface is moving to a dedicated sub-package. Please access it using "import {...} from '@coveo/headless/product-recommendation'".
   */
  CartRecommendationsListOptions,
  /**
   * @deprecated - The interface is moving to a dedicated sub-package. Please access it using "import {...} from '@coveo/headless/product-recommendation'".
   */
  CartRecommendationsListProps,
  /**
   * @deprecated - The interface is moving to a dedicated sub-package. Please access it using "import {...} from '@coveo/headless/product-recommendation'".
   */
  CartRecommendationsListState,
  /**
   * @deprecated - The interface is moving to a dedicated sub-package. Please access it using "import {...} from '@coveo/headless/product-recommendation'".
   */
  ProductRecommendation,
  /**
   * @deprecated - The interface is moving to a dedicated sub-package. Please access it using "import {...} from '@coveo/headless/product-recommendation'".
   */
  CartRecommendationsList,
  /**
   * @deprecated - The function is moving to a dedicated sub-package. Please access it using "import {...} from '@coveo/headless/product-recommendation'".
   */
  buildCartRecommendationsList,
} from './product-recommendations/headless-cart-recommendations';

export {
  /**
   * @deprecated - The interface is moving to a dedicated sub-package. Please access it using "import {...} from '@coveo/headless/product-recommendation'".
   */
  FrequentlyViewedTogetherListOptions,
  /**
   * @deprecated - The interface is moving to a dedicated sub-package. Please access it using "import {...} from '@coveo/headless/product-recommendation'".
   */
  FrequentlyViewedTogetherListProps,
  /**
   * @deprecated - The interface is moving to a dedicated sub-package. Please access it using "import {...} from '@coveo/headless/product-recommendation'".
   */
  FrequentlyViewedTogetherListState,
  /**
   * @deprecated - The interface is moving to a dedicated sub-package. Please access it using "import {...} from '@coveo/headless/product-recommendation'".
   */
  FrequentlyViewedTogetherList,
  /**
   * @deprecated - The function is moving to a dedicated sub-package. Please access it using "import {...} from '@coveo/headless/product-recommendation'".
   */
  buildFrequentlyViewedTogetherList,
} from './product-recommendations/headless-frequently-viewed-together';

export {
  /**
   * @deprecated - The interface is moving to a dedicated sub-package. Please access it using "import {...} from '@coveo/headless/product-recommendation'".
   */
  PopularBoughtRecommendationsListOptions,
  /**
   * @deprecated - The interface is moving to a dedicated sub-package. Please access it using "import {...} from '@coveo/headless/product-recommendation'".
   */
  PopularBoughtRecommendationsListProps,
  /**
   * @deprecated - The interface is moving to a dedicated sub-package. Please access it using "import {...} from '@coveo/headless/product-recommendation'".
   */
  PopularBoughtRecommendationsListState,
  /**
   * @deprecated - The interface is moving to a dedicated sub-package. Please access it using "import {...} from '@coveo/headless/product-recommendation'".
   */
  PopularBoughtRecommendationsList,
  /**
   * @deprecated - The function is moving to a dedicated sub-package. Please access it using "import {...} from '@coveo/headless/product-recommendation'".
   */
  buildPopularBoughtRecommendationsList,
} from './product-recommendations/headless-popular-bought-recommendations';

export {
  /**
   * @deprecated - The interface is moving to a dedicated sub-package. Please access it using "import {...} from '@coveo/headless/product-recommendation'".
   */
  PopularViewedRecommendationsListOptions,
  /**
   * @deprecated - The interface is moving to a dedicated sub-package. Please access it using "import {...} from '@coveo/headless/product-recommendation'".
   */
  PopularViewedRecommendationsListProps,
  /**
   * @deprecated - The interface is moving to a dedicated sub-package. Please access it using "import {...} from '@coveo/headless/product-recommendation'".
   */
  PopularViewedRecommendationsListState,
  /**
   * @deprecated - The interface is moving to a dedicated sub-package. Please access it using "import {...} from '@coveo/headless/product-recommendation'".
   */
  PopularViewedRecommendationsList,
  /**
   * @deprecated - The function is moving to a dedicated sub-package. Please access it using "import {...} from '@coveo/headless/product-recommendation'".
   */
  buildPopularViewedRecommendationsList,
} from './product-recommendations/headless-popular-viewed-recommendations';

export {
  /**
   * @deprecated - The interface is moving to a dedicated sub-package. Please access it using "import {...} from '@coveo/headless/product-recommendation'".
   */
  UserInterestRecommendationsListOptions,
  /**
   * @deprecated - The interface is moving to a dedicated sub-package. Please access it using "import {...} from '@coveo/headless/product-recommendation'".
   */
  UserInterestRecommendationsListProps,
  /**
   * @deprecated - The interface is moving to a dedicated sub-package. Please access it using "import {...} from '@coveo/headless/product-recommendation'".
   */
  UserInterestRecommendationsListState,
  /**
   * @deprecated - The interface is moving to a dedicated sub-package. Please access it using "import {...} from '@coveo/headless/product-recommendation'".
   */
  UserInterestRecommendationsList,
  /**
   * @deprecated - The function is moving to a dedicated sub-package. Please access it using "import {...} from '@coveo/headless/product-recommendation'".
   */
  buildUserInterestRecommendationsList,
} from './product-recommendations/headless-user-interest-recommendations';

export {
  SearchParameterManagerProps,
  SearchParameterManagerInitialState,
  SearchParameterManagerState,
  SearchParameterManager,
  SearchParameters,
  buildSearchParameterManager,
} from './search-parameter-manager/headless-search-parameter-manager';

export {
  UrlManagerProps,
  UrlManagerInitialState,
  UrlManagerState,
  UrlManager,
  buildUrlManager,
} from './url-manager/headless-url-manager';

export {
  SearchStatus,
  SearchStatusState,
  buildSearchStatus,
} from './search-status/headless-search-status';

export {ErrorPayload} from './controller/error-payload';

export {
  Quickview,
  QuickviewOptions,
  QuickviewProps,
  QuickviewState,
  buildQuickview,
} from './quickview/headless-quickview';

export {
  FoldedCollection,
  FoldedResult,
  FoldedResultList,
  FoldingOptions,
  FoldedResultListOptions,
  FoldedResultListProps,
  FoldedResultListState,
  buildFoldedResultList,
} from './folded-result-list/headless-folded-result-list';

export {
  RedirectionTrigger,
  RedirectionTriggerState,
  buildRedirectionTrigger,
} from './triggers/headless-redirection-trigger';

export {
  SmartSnippet,
  SmartSnippetState,
  buildSmartSnippet,
} from './smart-snippet/headless-smart-snippet';

export {
  SmartSnippetQuestionsList,
  SmartSnippetQuestionsListState,
  buildSmartSnippetQuestionsList,
} from './smart-snippet-questions-list/headless-smart-snippet-questions-list';
