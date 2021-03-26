import {StateWithHistory} from '../app/undoable';
import {HistoryState} from '../features/history/history-state';
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
} from './state-sections';

export type SearchParametersState = FacetSection &
  DateFacetSection &
  NumericFacetSection &
  CategoryFacetSection &
  FacetOptionsSection &
  QuerySection &
  AdvancedSearchQueriesSection &
  PaginationSection &
  SortSection &
  ContextSection &
  QuerySetSection &
  PipelineSection &
  SearchHubSection &
  DebugSection;

export type SearchAppState = SearchParametersState &
  ConfigurationSection &
  FacetSearchSection &
  CategoryFacetSearchSection &
  RedirectionSection &
  QuerySuggestionSection &
  SearchSection &
  ResultPreviewSection &
  DidYouMeanSection &
  FieldsSection &
  FacetOrderSection &
  VersionSection & {history: StateWithHistory<HistoryState>};
