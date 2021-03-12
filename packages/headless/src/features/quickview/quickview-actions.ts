import {createAsyncThunk} from '@reduxjs/toolkit';
import {HtmlRequestOptions} from '../../api/search/html/html-request';
import {AsyncThunkSearchOptions} from '../../api/search/search-api-client';
import {
  buildQuickviewRequest,
  StateNeededByHtmlEndpoint,
} from './quickview-request-builder';

export const fetchResultContent = createAsyncThunk<
  void,
  HtmlRequestOptions,
  AsyncThunkSearchOptions<StateNeededByHtmlEndpoint>
>(
  'quickview/fetchResultContent',
  async (options: HtmlRequestOptions, {extra, getState}) => {
    const state = getState();
    const req = buildQuickviewRequest(state, options);

    return await extra.searchAPIClient.html(req);
  }
);
