import {createAsyncThunk} from '@reduxjs/toolkit';
import {HtmlRequestOptions} from '../../api/search/html/html-request';
import {
  AsyncThunkSearchOptions,
  isErrorResponse,
} from '../../api/search/search-api-client';
import {
  buildQuickviewRequest,
  StateNeededByHtmlEndpoint,
} from './quickview-request-builder';

export const fetchResultContent = createAsyncThunk<
  string,
  HtmlRequestOptions,
  AsyncThunkSearchOptions<StateNeededByHtmlEndpoint>
>(
  'quickview/fetchResultContent',
  async (options: HtmlRequestOptions, {extra, getState, rejectWithValue}) => {
    const state = getState();
    const req = buildQuickviewRequest(state, options);
    const res = await extra.searchAPIClient.html(req);

    if (isErrorResponse(res)) {
      return rejectWithValue(res.error);
    }

    return res.success;
  }
);
