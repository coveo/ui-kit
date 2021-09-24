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
import {
  AnalyticsType,
  documentIdentifier,
  makeAnalyticsAction,
  partialDocumentInformation,
  validateResultPayload,
} from '../analytics/analytics-utils';

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

const logDocumentQuickview = (result: Result) => {
  return buildDocumentQuickviewThunk(result)();
};

const buildDocumentQuickviewThunk = (result: Result) => {
  return makeAnalyticsAction(
    'analytics/resultPreview/open',
    AnalyticsType.Click,
    (client, state) => {
      validateResultPayload(result);
      const info = partialDocumentInformation(result, state);
      const id = documentIdentifier(result);
      return client.logDocumentQuickview(info, id);
    }
  );
};
