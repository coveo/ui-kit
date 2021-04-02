import {createAsyncThunk} from '@reduxjs/toolkit';
import {HtmlRequestOptions} from '../../api/search/html/html-request';
import {
  AsyncThunkSearchOptions,
  isErrorResponse,
} from '../../api/search/search-api-client';
import {
  buildResultPreviewRequest,
  StateNeededByHtmlEndpoint,
} from './result-preview-request-builder';

interface FetchResultContentResponse {
  content: string;
  uniqueId: string;
}

export const fetchResultContent = createAsyncThunk<
  FetchResultContentResponse,
  HtmlRequestOptions,
  AsyncThunkSearchOptions<StateNeededByHtmlEndpoint>
>(
  'resultPreview/fetchResultContent',
  async (options: HtmlRequestOptions, {extra, getState, rejectWithValue}) => {
    const state = getState();
    const req = buildResultPreviewRequest(state, options);
    const res = await extra.searchAPIClient.html(req);

    if (isErrorResponse(res)) {
      return rejectWithValue(res.error);
    }

    return {
      content: res.success,
      uniqueId: options.uniqueId,
    };
  }
);
