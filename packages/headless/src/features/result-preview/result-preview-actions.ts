import {createAsyncThunk} from '@reduxjs/toolkit';
import {
  buildContentURL,
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

interface UpdateContentURLActionCreatorPayload {
  /**
   * The path to retrieve result quickview content.
   */
  contentURL?: string;
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

type UpdateContentURLOptions = HtmlRequestOptions & {
  path: string;
  buildResultPreviewRequest: (
    state: StateNeededByHtmlEndpoint,
    options: HtmlRequestOptions
  ) => Promise<HtmlRequest>;
};

const MAX_GET_LENGTH = 2048;

export const updateContentURL = createAsyncThunk<
  UpdateContentURLActionCreatorPayload,
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

    if (contentURL.length > MAX_GET_LENGTH) {
      extra.logger.error(
        `The content URL was truncated as it exceeds the maximum allowed length of ${MAX_GET_LENGTH} characters.`
      );
    }

    return {
      contentURL: contentURL,
    };
  }
);
