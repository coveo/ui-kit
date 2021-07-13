import {OmniboxSuggestionsMetadata} from 'coveo.analytics/src/searchPage/searchPageEvents';
import {SearchAppState} from '../../state/search-app-state';
import {AnalyticsType, makeAnalyticsAction} from '../analytics/analytics-utils';

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

export const logQuerySuggestionClick = (
  payload: LogQuerySuggestionClickActionCreatorPayload
) =>
  makeAnalyticsAction(
    'analytics/querySuggest',
    AnalyticsType.Search,
    (client, state) => {
      const metadata = buildOmniboxSuggestionMetadata(state, payload);
      return client.logOmniboxAnalytics(metadata);
    }
  )();

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

  return {
    suggestionRanking: suggestions.indexOf(suggestion),
    partialQuery:
      querySuggest.partialQueries[querySuggest.partialQueries.length - 1],
    partialQueries: querySuggest.partialQueries,
    suggestions,
  };
}
