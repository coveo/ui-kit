import {configureAnalytics} from '../../api/analytics/analytics';
import {createAsyncThunk} from '@reduxjs/toolkit';
import {
  makeSearchActionType,
  searchPageState,
} from '../analytics/analytics-actions';
import {OmniboxSuggestionsMetadata} from 'coveo.analytics/src/searchPage/searchPageEvents';

export const logQuerySuggestionClick = createAsyncThunk(
  'analytics/querySuggest',
  async ({id, suggestion}: {id: string; suggestion: string}, {getState}) => {
    const state = searchPageState(getState);
    const querySuggest = state.querySuggest[id];

    if (!querySuggest) {
      return null;
    }
    const suggestions = querySuggest.completions.map(
      (completion) => completion.expression
    );

    const payload: OmniboxSuggestionsMetadata = {
      suggestionRanking: suggestions.indexOf(suggestion),
      partialQuery: state.querySuggest[id]!.q,
      partialQueries: state.querySuggest[id]!.partialQueries,
      suggestions,
    };

    await configureAnalytics(state).logOmniboxAnalytics(payload);
    return makeSearchActionType();
  }
);
