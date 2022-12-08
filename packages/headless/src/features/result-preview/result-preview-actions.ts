import {createAsyncThunk} from '@reduxjs/toolkit';
import {
  buildSrcPath,
  HtmlApiClient,
} from '../../api/search/html/html-api-client';
import {
  HtmlRequest,
  HtmlRequestOptions,
} from '../../api/search/html/html-request';
import {isErrorResponse} from '../../api/search/search-api-client';
import {SearchAPIErrorWithStatusCode} from '../../api/search/search-api-error-response';
import {AsyncThunkOptions} from '../../app/async-thunk-options';
import {ClientThunkExtraArguments} from '../../app/thunk-extra-arguments';
import {
  buildResultPreviewRequest,
  StateNeededByHtmlEndpoint,
} from './result-preview-request-builder';

interface FetchResultContentResponse {
  content: string;
  uniqueId: string;
}

interface UpdateSrcPathActionCreatorPayload {
  /**
   * The path to retrieve result quickview content.
   */
  srcPath?: string;
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

type UpdateSrcPathOptions = HtmlRequestOptions & {
  path: string;
  buildResultPreviewRequest: (
    state: StateNeededByHtmlEndpoint,
    options: HtmlRequestOptions
  ) => Promise<HtmlRequest>;
};

export const updateSrcPath = createAsyncThunk<
  UpdateSrcPathActionCreatorPayload,
  UpdateSrcPathOptions,
  AsyncThunkGlobalOptions<StateNeededByHtmlEndpoint>
>(
  'resultPreview/updateSrcPath',
  async (options: UpdateSrcPathOptions, {getState}) => {
    const state = getState();
    const srcPath = buildSrcPath(
      await options.buildResultPreviewRequest(state, {
        uniqueId: options.uniqueId,
        requestedOutputSize: options.requestedOutputSize,
      }),
      options.path
    );

    return {
      srcPath,
    };
  }
);
