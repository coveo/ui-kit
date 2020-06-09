import {createAsyncThunk} from '@reduxjs/toolkit';
import {SearchAPIClient} from '../../api/search/search-api-client';
import {HeadlessState} from '../../state';

/**
 * Executes a search query.
 */
export const executeSearch = createAsyncThunk(
  'search/execute',
  async (_, {getState}) => {
    const startedAt = new Date().getTime();
    const response = await SearchAPIClient.search(getState() as HeadlessState);
    const duration = new Date().getTime() - startedAt;
    return {response, duration};
  }
);
