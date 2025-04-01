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
  InstantResultSection,
  QuerySuggestionSection,
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
  AutomaticFacetSection,
  GeneratedAnswerSection,
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
