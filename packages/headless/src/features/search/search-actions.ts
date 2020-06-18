import {createAsyncThunk} from '@reduxjs/toolkit';
import {SearchAPIClient} from '../../api/search/search-api-client';
import {SearchPageState} from '../../state';

/**
 * Executes a search query.
 */
export const executeSearch = createAsyncThunk(
  'search/executeSearch',
  async (_, {getState}) => {
    const startedAt = new Date().getTime();
    const response = await SearchAPIClient.search(
      getState() as SearchPageState
    );
    const duration = new Date().getTime() - startedAt;
    return {response, duration};
  }
);
