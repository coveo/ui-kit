import {createAsyncThunk} from '@reduxjs/toolkit';
import {SearchAPIClient} from '../../api/search/search-api-client';
import {HeadlessState} from '../../state';

/**
 * Executes a search query.
 */
export const executeSearch = createAsyncThunk(
  'search/execute',
  async (_, {getState}) => {
    return await SearchAPIClient.search(getState() as HeadlessState);
  }
);
