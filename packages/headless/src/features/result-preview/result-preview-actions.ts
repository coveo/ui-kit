import {createAsyncThunk} from '@reduxjs/toolkit';
import {Result} from '../../api/search/search/result';
import {
  AsyncThunkSearchOptions,
  isErrorResponse,
} from '../../api/search/search-api-client';
import {
  buildResultPreviewRequest,
  StateNeededByHtmlEndpoint,
} from './result-preview-request-builder';
import {logDocumentQuickview} from './result-preview-analytics-actions';

interface FetchResultContentResponse {
  content: string;
  uniqueId: string;
}

interface FetchResultContentOptions {
  result: Result;
  requestedOutputSize?: number;
}

export const fetchResultContent = createAsyncThunk<
  FetchResultContentResponse,
  FetchResultContentOptions,
  AsyncThunkSearchOptions<StateNeededByHtmlEndpoint>
>(
  'resultPreview/fetchResultContent',
  async (
    options: FetchResultContentOptions,
    {extra, getState, rejectWithValue}
  ) => {
    const {result, requestedOutputSize} = options;
    const uniqueId = result.uniqueId;
    const state = getState();
    const req = buildResultPreviewRequest(state, {
      uniqueId,
      requestedOutputSize,
    });

    const res = await extra.searchAPIClient.html(req);

    if (isErrorResponse(res)) {
      return rejectWithValue(res.error);
    }

    return {
      content: res.success,
      uniqueId,
      analyticsAction: logDocumentQuickview(result),
    };
  }
);
