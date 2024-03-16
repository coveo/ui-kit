import type {OmniboxSuggestionsMetadata} from 'coveo.analytics/dist/definitions/searchPage/searchPageEvents';
import {SearchAppState} from '../../state/search-app-state';
import {
  makeAnalyticsAction,
  LegacySearchAction,
} from '../analytics/analytics-utils';
import {SearchPageEvents} from '../analytics/search-action-cause';
import {SearchAction} from '../search/search-actions';

export interface LogQuerySuggestionClickActionCreatorPayload {
  /**
   * The search box id.
   */
  id: string;

  /**
   * The selected query suggestion.
   */
  suggestion: string;
}


export const omniboxAnalytics = (): SearchAction => ({
  actionCause: SearchPageEvents.omniboxAnalytics,
});

export type OmniboxSuggestionMetadata = OmniboxSuggestionsMetadata;

export function buildOmniboxSuggestionMetadata(
  state: Partial<SearchAppState>,
  payload: LogQuerySuggestionClickActionCreatorPayload
): OmniboxSuggestionMetadata {
  const {id, suggestion} = payload;
  const querySuggest = state.querySuggest && state.querySuggest[id];

  if (!querySuggest) {
    throw new Error(
      `Unable to determine the query suggest analytics metadata to send because no query suggest with id "${id}" was found. Please check the sent #id.`
    );
  }

  const suggestions = querySuggest.completions.map(
    (completion) => completion.expression
  );

  const lastIndex = querySuggest.partialQueries.length - 1;
  const partialQuery = querySuggest.partialQueries[lastIndex] || '';
  const querySuggestResponseId = querySuggest.responseId;

  return {
    suggestionRanking: suggestions.indexOf(suggestion),
    partialQuery,
    partialQueries: querySuggest.partialQueries,
    suggestions,
    querySuggestResponseId,
  };
}
