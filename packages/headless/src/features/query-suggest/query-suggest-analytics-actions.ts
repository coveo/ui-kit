import {OmniboxSuggestionsMetadata} from 'coveo.analytics/src/searchPage/searchPageEvents';
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
      const {id, suggestion} = payload;
      const querySuggest = state.querySuggest && state.querySuggest[id];
      if (querySuggest !== null && querySuggest !== undefined) {
        const suggestions = querySuggest.completions.map(
          (completion) => completion.expression
        );

        const payload: OmniboxSuggestionsMetadata = {
          suggestionRanking: suggestions.indexOf(suggestion),
          partialQuery:
            querySuggest.partialQueries[querySuggest.partialQueries.length - 1],
          partialQueries: querySuggest.partialQueries,
          suggestions,
        };
        return client.logOmniboxAnalytics(payload);
      }

      return;
    }
  )();
