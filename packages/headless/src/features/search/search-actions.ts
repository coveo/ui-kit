import {createAsyncThunk} from '@reduxjs/toolkit';
import {SearchAPIClient} from '../../api/search/search-api-client';
import {SearchPageState} from '../../state';
import {SearchAction} from '../analytics/analytics-actions';

/**
 * Executes a search query.
 */
export const executeSearch = createAsyncThunk(
  'search/executeSearch',
  async (analyticsAction: SearchAction, {getState, dispatch}) => {
    const state = getState() as SearchPageState;
    const startedAt = new Date().getTime();
    const response = await SearchAPIClient.search(state);
    const duration = new Date().getTime() - startedAt;
    const queryExecuted = state.query.q;
    dispatch(analyticsAction);
    return {response, duration, queryExecuted};
  }
);
