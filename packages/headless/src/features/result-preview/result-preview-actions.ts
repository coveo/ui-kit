import {ArrayValue} from '@coveo/bueno';
import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {
  buildContentURL,
  type HtmlApiClient,
} from '../../api/search/html/html-api-client.js';
import type {
  HtmlRequest,
  HtmlRequestOptions,
} from '../../api/search/html/html-request.js';
import type {Result} from '../../api/search/search/result.js';
import {isErrorResponse} from '../../api/search/search-api-client.js';
import type {SearchAPIErrorWithStatusCode} from '../../api/search/search-api-error-response.js';
import type {AsyncThunkOptions} from '../../app/async-thunk-options.js';
import type {ClientThunkExtraArguments} from '../../app/thunk-extra-arguments.js';
import {validatePayload} from '../../utils/validate-payload.js';
import {
  buildResultPreviewRequest,
  type StateNeededByHtmlEndpoint,
} from './result-preview-request-builder.js';

export interface FetchResultContentThunkReturn {
  content: string;
  uniqueId: string;
}

export interface UpdateContentURLThunkReturn {
  /**
   * The path to retrieve result quickview content.
   */
  contentURL?: string;
}

export interface PreparePreviewPaginationActionPayload {
  results: Pick<Result, 'hasHtmlVersion' | 'uniqueId'>[];
}

export interface AsyncThunkGlobalOptions<T>
  extends AsyncThunkOptions<T, ClientThunkExtraArguments<HtmlApiClient>> {
  rejectValue: SearchAPIErrorWithStatusCode;
}

export const fetchResultContent = createAsyncThunk<
  FetchResultContentThunkReturn,
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

export const nextPreview = createAction('resultPreview/next');
export const previousPreview = createAction('resultPreview/previous');
export const preparePreviewPagination = createAction(
  'resultPreview/prepare',
  (payload: PreparePreviewPaginationActionPayload) =>
    validatePayload(payload, {results: new ArrayValue({required: true})})
);

export type UpdateContentURLOptions = HtmlRequestOptions & {
  path: string;
  buildResultPreviewRequest: (
    state: StateNeededByHtmlEndpoint,
    options: HtmlRequestOptions
  ) => Promise<HtmlRequest>;
};

const MAX_GET_LENGTH = 2048;

export const updateContentURL = createAsyncThunk<
  UpdateContentURLThunkReturn,
  UpdateContentURLOptions,
  AsyncThunkGlobalOptions<StateNeededByHtmlEndpoint>
>(
  'resultPreview/updateContentURL',
  async (options: UpdateContentURLOptions, {getState, extra}) => {
    const state = getState();
    const contentURL = buildContentURL(
      await options.buildResultPreviewRequest(state, {
        uniqueId: options.uniqueId,
        requestedOutputSize: options.requestedOutputSize,
      }),
      options.path
    );

    if (contentURL?.length > MAX_GET_LENGTH) {
      extra.logger.error(
        `The content URL was truncated as it exceeds the maximum allowed length of ${MAX_GET_LENGTH} characters.`
      );
    }

    return {
      contentURL: contentURL,
    };
  }
);
