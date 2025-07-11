import type {OmniboxSuggestionsMetadata} from 'coveo.analytics/dist/definitions/searchPage/searchPageEvents.js';
import type {SearchAppState} from '../../state/search-app-state.js';
import {
  type LegacySearchAction,
  makeAnalyticsAction,
} from '../analytics/analytics-utils.js';
import {SearchPageEvents} from '../analytics/search-action-cause.js';
import type {SearchAction} from '../search/search-actions.js';

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

//TODO: KIT-2859
export const logQuerySuggestionClick = (
  payload: LogQuerySuggestionClickActionCreatorPayload
): LegacySearchAction =>
  makeAnalyticsAction('analytics/querySuggest', (client, state) => {
    const metadata = buildOmniboxSuggestionMetadata(state, payload);
    return client.makeOmniboxAnalytics(metadata);
  });

export const omniboxAnalytics = (): SearchAction => ({
  actionCause: SearchPageEvents.omniboxAnalytics,
});

export type OmniboxSuggestionMetadata = OmniboxSuggestionsMetadata;

export function buildOmniboxSuggestionMetadata(
  state: Partial<SearchAppState>,
  payload: LogQuerySuggestionClickActionCreatorPayload
): OmniboxSuggestionMetadata {
  const {id, suggestion} = payload;
  const querySuggest = state.querySuggest?.[id];

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
