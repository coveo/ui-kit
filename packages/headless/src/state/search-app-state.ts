import type {
  AdvancedSearchQueriesSection,
  AutomaticFacetSection,
  CategoryFacetSearchSection,
  CategoryFacetSection,
  ConfigurationSection,
  ContextSection,
  DateFacetSection,
  DebugSection,
  DictionaryFieldContextSection,
  DidYouMeanSection,
  ExcerptLengthSection,
  FacetOptionsSection,
  FacetOrderSection,
  FacetSearchSection,
  FacetSection,
  FieldsSection,
  FoldingSection,
  GeneratedAnswerSection,
  HistorySection,
  InstantResultSection,
  NumericFacetSection,
  PaginationSection,
  PipelineSection,
  QuerySection,
  QuerySetSection,
  QuerySuggestionSection,
  QuestionAnsweringSection,
  RecentQueriesSection,
  RecentResultsSection,
  ResultPreviewSection,
  SearchHubSection,
  SearchSection,
  SortSection,
  StandaloneSearchBoxSection,
  StaticFilterSection,
  TabSection,
  TriggerSection,
  VersionSection,
} from './state-sections.js';

export type SearchParametersState = FacetSection &
  DateFacetSection &
  NumericFacetSection &
  CategoryFacetSection &
  AutomaticFacetSection &
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
  ExcerptLengthSection &
  GeneratedAnswerSection &
  InstantResultSection;
