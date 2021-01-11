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
} from './state-sections';

/**
 * @docsection Types
 */
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

/**
 * @docsection Types
 */
export type SearchAppState = SearchParametersState &
  ConfigurationSection &
  FacetSearchSection &
  CategoryFacetSearchSection &
  RedirectionSection &
  QuerySuggestionSection &
  SearchSection &
  DidYouMeanSection &
  FieldsSection &
  FacetOrderSection & {history: StateWithHistory<HistoryState>};
