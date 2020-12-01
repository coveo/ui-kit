import {OmniboxSuggestionsMetadata} from 'coveo.analytics/src/searchPage/searchPageEvents';
import {AnalyticsType, makeAnalyticsAction} from '../analytics/analytics-utils';

export const logQuerySuggestionClick = ({
  id,
  suggestion,
}: {
  id: string;
  suggestion: string;
}) =>
  makeAnalyticsAction(
    'analytics/querySuggest',
    AnalyticsType.Search,
    (client, state) => {
      const querySuggest = state.querySuggest && state.querySuggest[id];
      if (querySuggest !== null && querySuggest !== undefined) {
        const suggestions = querySuggest.completions.map(
          (completion) => completion.expression
        );

        const payload: OmniboxSuggestionsMetadata = {
          suggestionRanking: suggestions.indexOf(suggestion),
          partialQuery: querySuggest.q,
          partialQueries: querySuggest.partialQueries,
          suggestions,
        };
        return client.logOmniboxAnalytics(payload);
      }

      return;
    }
  )();
