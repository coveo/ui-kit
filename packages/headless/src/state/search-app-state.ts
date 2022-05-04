import {
  CategoryFacetSearchSection,
  CategoryFacetSection,
  ConfigurationSection,
  AdvancedSearchQueriesSection,
  ContextSection,
  DateFacetSection,
  DidYouMeanSection,
  FacetSearchSection,
  FacetSection,
  FieldsSection,
  NumericFacetSection,
  PaginationSection,
  PipelineSection,
  QuerySetSection,
  QuerySuggestionSection,
  RedirectionSection,
  SearchHubSection,
  SearchSection,
  SortSection,
  QuerySection,
  FacetOptionsSection,
  DebugSection,
  FacetOrderSection,
  ResultPreviewSection,
  VersionSection,
  HistorySection,
  FoldingSection,
  TriggerSection,
  QuestionAnsweringSection,
  StandaloneSearchBoxSection,
  RecentResultsSection,
  RecentQueriesSection,
  DictionaryFieldContextSection,
  TabSection,
  StaticFilterSection,
  ExcerptLengthSection,
} from './state-sections';

export type SearchParametersState = FacetSection &
  DateFacetSection &
  NumericFacetSection &
  CategoryFacetSection &
  FacetOptionsSection &
  QuerySection &
  TabSection &
  AdvancedSearchQueriesSection &
  StaticFilterSection &
  PaginationSection &
  SortSection &
  ContextSection &
  DictionaryFieldContextSection &
  QuerySetSection &
  PipelineSection &
  SearchHubSection &
  DebugSection;

export type SearchAppState = SearchParametersState &
  ConfigurationSection &
  FacetSearchSection &
  CategoryFacetSearchSection &
  RedirectionSection &
  StandaloneSearchBoxSection &
  QuerySuggestionSection &
  SearchSection &
  ResultPreviewSection &
  DidYouMeanSection &
  FieldsSection &
  FacetOrderSection &
  VersionSection &
  HistorySection &
  FoldingSection &
  TriggerSection &
  QuestionAnsweringSection &
  RecentResultsSection &
  RecentQueriesSection &
  ExcerptLengthSection;
