import {createAsyncThunk} from '@reduxjs/toolkit';
import {HtmlRequestOptions} from '../../api/search/html/html-request';
import {isErrorResponse} from '../../api/search/search-api-client';
import {
  buildResultPreviewRequest,
  StateNeededByHtmlEndpoint,
} from './result-preview-request-builder';
import {ClientThunkExtraArguments} from '../../app/thunk-extra-arguments';
import {HtmlApiClient} from '../../api/search/html/html-api-client';
import {AsyncThunkOptions} from '../../app/async-thunk-options';
import {SearchAPIErrorWithStatusCode} from '../../api/search/search-api-error-response';

interface FetchResultContentResponse {
  content: string;
  uniqueId: string;
}

export interface AsyncThunkGlobalOptions<T>
  extends AsyncThunkOptions<T, ClientThunkExtraArguments<HtmlApiClient>> {
  rejectValue: SearchAPIErrorWithStatusCode;
}

export const fetchResultContent = createAsyncThunk<
  FetchResultContentResponse,
  HtmlRequestOptions,
  AsyncThunkGlobalOptions<StateNeededByHtmlEndpoint>
>(
  'resultPreview/fetchResultContent',
  async (options: HtmlRequestOptions, {extra, getState, rejectWithValue}) => {
    const state = getState();
    const req = await buildResultPreviewRequest(state, options);
    const res = await extra.apiClient.html(req);

    if (isErrorResponse(res)) {
      return rejectWithValue(res.error);
    }

    return {
      content: res.success,
      uniqueId: options.uniqueId,
    };
  }
);
