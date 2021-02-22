import {StateWithHistory} from '../app/undoable';
import {HistoryState} from '../features/history/history-state';
import {
  CategoryFacetSearchSection,
  CategoryFacetSection,
  ConfigurationSection,
  AdvancedSearchQueriesSection,
  DefaultsSection,
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
  DefaultsSection &
  ConfigurationSection &
  FacetSearchSection &
  CategoryFacetSearchSection &
  RedirectionSection &
  QuerySuggestionSection &
  SearchSection &
  DidYouMeanSection &
  FieldsSection &
  FacetOrderSection & {history: StateWithHistory<HistoryState>};
