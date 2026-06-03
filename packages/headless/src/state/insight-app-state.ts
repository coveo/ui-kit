import type {
  AttachedResultsSection,
  CategoryFacetSection,
  ConfigurationSection,
  ContextSection,
  DateFacetSection,
  DidYouMeanSection,
  FacetOptionsSection,
  FacetSearchSection,
  FacetSection,
  FieldsSection,
  FoldingSection,
  GeneratedAnswerSection,
  InsightCaseContextSection,
  InsightConfigurationSection,
  InsightInterfaceSection,
  InsightUserActionsSection,
  NumericFacetSection,
  PaginationSection,
  QuerySection,
  QuerySetSection,
  QuerySuggestionSection,
  QuestionAnsweringSection,
  RecentQueriesSection,
  ResultPreviewSection,
  SearchHubSection,
  SearchSection,
  SortSection,
  StaticFilterSection,
  TabSection,
  TriggerSection,
  VersionSection,
} from './state-sections.js';

type InsightSearchParametersState = FacetSection &
  DateFacetSection &
  NumericFacetSection &
  CategoryFacetSection &
  QuerySection &
  TabSection &
  FieldsSection &
  SortSection;

export type InsightAppState = InsightSearchParametersState &
  SearchHubSection &
  ConfigurationSection &
  VersionSection &
  InsightConfigurationSection &
  SearchSection &
  PaginationSection &
  InsightInterfaceSection &
  InsightCaseContextSection &
  ResultPreviewSection &
  FacetSection &
  FacetSearchSection &
  FacetOptionsSection &
  QuerySetSection &
  QuerySuggestionSection &
  SortSection &
  StaticFilterSection &
  DidYouMeanSection &
  AttachedResultsSection &
  QuestionAnsweringSection &
  FoldingSection &
  GeneratedAnswerSection &
  ContextSection &
  InsightUserActionsSection &
  TriggerSection &
  RecentQueriesSection;
