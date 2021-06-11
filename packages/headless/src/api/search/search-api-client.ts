import {
  PlatformClient,
  PlatformResponse,
  PreprocessRequestMiddleware,
} from '../platform-client';
import {PlanResponseSuccess, Plan} from './plan/plan-response';
import {
  QuerySuggestSuccessResponse,
  QuerySuggest,
} from './query-suggest/query-suggest-response';
import {SearchRequest} from './search/search-request';
import {Search, SearchResponseSuccess} from './search/search-response';
import {
  SearchAPIErrorWithStatusCode,
  SearchAPIErrorWithExceptionInBody,
  buildAPIResponseFromErrorOrThrow,
} from './search-api-error-response';
import {PlanRequest} from './plan/plan-request';
import {QuerySuggestRequest} from './query-suggest/query-suggest-request';
import {FacetSearchRequest} from './facet-search/facet-search-request';
import {SearchAppState} from '../../state/search-app-state';
import {baseSearchRequest} from './search-api-params';
import {RecommendationRequest} from './recommendation/recommendation-request';
import {ProductRecommendationsRequest} from './product-recommendations/product-recommendations-request';
import {Logger} from 'pino';
import {
  PostprocessFacetSearchResponseMiddleware,
  PostprocessQuerySuggestResponseMiddleware,
  PostprocessSearchResponseMiddleware,
} from './search-api-client-middleware';
import {PreprocessRequest} from '../preprocess-request';
import {HtmlRequest} from './html/html-request';
import {findEncoding} from './encoding-finder';
import {TextDecoder} from 'web-encoding';
import {BaseParam} from '../platform-service-params';
import {SearchThunkExtraArguments} from '../../app/search-thunk-extra-arguments';

export type AllSearchAPIResponse = Plan | Search | QuerySuggest;

export interface AsyncThunkSearchOptions<T extends Partial<SearchAppState>> {
  state: T;
  rejectValue: SearchAPIErrorWithStatusCode;
  extra: SearchThunkExtraArguments;
}

export interface SearchAPIClientOptions {
  /**
   * @deprecated - Token renewal is now managed using middleware to avoid a circular dependency. Please remove this option in preparation for v1.
   */
  renewAccessToken: () => Promise<string>;
  logger: Logger;
  preprocessRequest: PreprocessRequest;
  deprecatedPreprocessRequest: PreprocessRequestMiddleware;
  postprocessSearchResponseMiddleware: PostprocessSearchResponseMiddleware;
  postprocessQuerySuggestResponseMiddleware: PostprocessQuerySuggestResponseMiddleware;
  postprocessFacetSearchResponseMiddleware: PostprocessFacetSearchResponseMiddleware;
}

export type SearchAPIClientResponse<T> =
  | {success: T}
  | {error: SearchAPIErrorWithStatusCode};

export class SearchAPIClient {
  constructor(private options: SearchAPIClientOptions) {}

  async plan(
    req: PlanRequest
  ): Promise<SearchAPIClientResponse<PlanResponseSuccess>> {
    const response = await PlatformClient.call({
      ...baseSearchRequest(req, 'POST', 'application/json', '/plan'),
      requestParams: pickNonBaseParams(req),
      ...this.options,
    });

    if (response instanceof Error) {
      return buildAPIResponseFromErrorOrThrow(response);
    }

    const body = await response.json();

    if (isSuccessPlanResponse(body)) {
      return {success: body};
    }

    return {
      error: unwrapError({response, body}),
    };
  }

  async querySuggest(
    req: QuerySuggestRequest
  ): Promise<SearchAPIClientResponse<QuerySuggestSuccessResponse>> {
    const response = await PlatformClient.call({
      ...baseSearchRequest(req, 'POST', 'application/json', '/querySuggest'),
      requestParams: pickNonBaseParams(req),
      ...this.options,
    });

    if (response instanceof Error) {
      return buildAPIResponseFromErrorOrThrow(response);
    }

    const body = await response.json();
    const payload = {response, body};

    if (isSuccessQuerySuggestionsResponse(body)) {
      const processedResponse = await this.options.postprocessQuerySuggestResponseMiddleware(
        payload
      );
      return {
        success: processedResponse.body,
      };
    }
    return {
      error: unwrapError(payload),
    };
  }

  private searchAbortController: AbortController | null = null;

  async search(
    req: SearchRequest
  ): Promise<SearchAPIClientResponse<SearchResponseSuccess>> {
    if (this.searchAbortController) {
      this.options.logger.warn('Cancelling current pending search query');
      this.searchAbortController.abort();
    }
    this.searchAbortController = this.getAbortControllerInstanceIfAvailable();

    const response = await PlatformClient.call({
      ...baseSearchRequest(req, 'POST', 'application/json', ''),
      requestParams: pickNonBaseParams(req),
      ...this.options,
      signal: this.searchAbortController?.signal,
    });

    if (response instanceof Error) {
      return buildAPIResponseFromErrorOrThrow(response);
    }

    this.searchAbortController = null;

    const body = await response.json();
    const payload = {response, body};

    if (isSuccessSearchResponse(body)) {
      const processedResponse = await this.options.postprocessSearchResponseMiddleware(
        payload
      );
      return {
        success: processedResponse.body,
      };
    }

    return {
      error: unwrapError(payload),
    };
  }

  async facetSearch(req: FacetSearchRequest) {
    const response = await PlatformClient.call({
      ...baseSearchRequest(req, 'POST', 'application/json', '/facet'),
      requestParams: pickNonBaseParams(req),
      ...this.options,
    });

    if (response instanceof Error) {
      throw response;
    }

    const body = await response.json();
    const payload = {response, body};

    const processedResponse = await this.options.postprocessFacetSearchResponseMiddleware(
      payload
    );

    return processedResponse.body;
  }

  async recommendations(req: RecommendationRequest) {
    const response = await PlatformClient.call({
      ...baseSearchRequest(req, 'POST', 'application/json', ''),
      requestParams: pickNonBaseParams(req),
      ...this.options,
    });

    if (response instanceof Error) {
      throw response;
    }

    const body = await response.json();

    if (isSuccessSearchResponse(body)) {
      return {success: body};
    }

    return {
      error: unwrapError({response, body}),
    };
  }

  async html(req: HtmlRequest) {
    const response = await PlatformClient.call({
      ...baseSearchRequest(
        req,
        'POST',
        'application/x-www-form-urlencoded',
        '/html'
      ),
      requestParams: pickNonBaseParams(req),
      ...this.options,
    });

    if (response instanceof Error) {
      throw response;
    }

    const encoding = findEncoding(response);
    const buffer = await response.arrayBuffer();
    const decoder = new TextDecoder(encoding);
    const body = decoder.decode(buffer);

    if (isSuccessHtmlResponse(body)) {
      return {success: body};
    }

    return {error: unwrapError({response, body})};
  }

  async productRecommendations(req: ProductRecommendationsRequest) {
    const response = await PlatformClient.call({
      ...baseSearchRequest(req, 'POST', 'application/json', ''),
      requestParams: pickNonBaseParams(req),
      ...this.options,
    });

    if (response instanceof Error) {
      throw response;
    }

    const body = await response.json();

    if (isSuccessSearchResponse(body)) {
      return {success: body};
    }

    return {
      error: unwrapError({response, body}),
    };
  }

  private getAbortControllerInstanceIfAvailable(): AbortController | null {
    // For nodejs environments only, we want to load the implementation of AbortController from node-abort-controller package.
    // For browser environments, we need to make sure that we don't use AbortController as it might not be available (Locker Service in Salesforce)
    // This is not something that can be polyfilled in a meaningful manner.
    // This is a low level browser API after all, and only JS code inside a polyfill cannot actually cancel network requests done by the browser.

    if (typeof window === 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const nodeAbort = require('node-abort-controller');
      return new nodeAbort() as AbortController;
    }
    return typeof AbortController === 'undefined'
      ? null
      : new AbortController();
  }
}

const unwrapError = (
  payload: PlatformResponse<AllSearchAPIResponse>
): SearchAPIErrorWithStatusCode => {
  const {response} = payload;

  if (response.body) {
    return unwrapSearchApiError(payload);
  }

  return unwrapClientError(response);
};

const unwrapSearchApiError = (
  payload: PlatformResponse<AllSearchAPIResponse>
) => {
  if (isSearchAPIException(payload)) {
    return unwrapErrorByException(payload);
  }

  if (isSearchAPIErrorWithStatusCode(payload)) {
    return payload.body;
  }

  return {message: 'unknown', statusCode: 0, type: 'unknown'};
};

const unwrapClientError = (response: Response) => {
  // Transform an error to an object https://stackoverflow.com/a/26199752
  const body = JSON.parse(
    JSON.stringify(response, Object.getOwnPropertyNames(response))
  ) as Error;

  return {
    ...body,
    message: `Client side error: ${body.message || ''}`,
    statusCode: 400,
    type: 'ClientError',
  };
};

const unwrapErrorByException = (
  res: PlatformResponse<SearchAPIErrorWithExceptionInBody>
): SearchAPIErrorWithStatusCode => ({
  message: res.body.exception.code,
  statusCode: res.response.status,
  type: res.body.exception.code,
});

export const isSuccessResponse = <T>(
  r: SearchAPIClientResponse<T>
): r is {success: T} => {
  return (r as {success: T}).success !== undefined;
};

export const isErrorResponse = <T>(
  r: SearchAPIClientResponse<T>
): r is {error: SearchAPIErrorWithStatusCode} => {
  return (r as {error: SearchAPIErrorWithStatusCode}).error !== undefined;
};

function isSuccessQuerySuggestionsResponse(
  body: unknown
): body is QuerySuggestSuccessResponse {
  return (body as QuerySuggestSuccessResponse).completions !== undefined;
}

function isSuccessPlanResponse(body: unknown): body is PlanResponseSuccess {
  return (body as PlanResponseSuccess).preprocessingOutput !== undefined;
}

function isSuccessHtmlResponse(body: unknown): body is string {
  return typeof body === 'string';
}

function isSuccessSearchResponse(body: unknown): body is SearchResponseSuccess {
  return (body as SearchResponseSuccess).results !== undefined;
}

function isSearchAPIErrorWithStatusCode(
  r: PlatformResponse<AllSearchAPIResponse>
): r is PlatformResponse<SearchAPIErrorWithStatusCode> {
  return (
    (r as PlatformResponse<SearchAPIErrorWithStatusCode>).body.statusCode !==
    undefined
  );
}

function isSearchAPIException(
  r: PlatformResponse<AllSearchAPIResponse>
): r is PlatformResponse<SearchAPIErrorWithExceptionInBody> {
  return (
    (r as PlatformResponse<SearchAPIErrorWithExceptionInBody>).body
      .exception !== undefined
  );
}

function pickNonBaseParams<Params extends BaseParam>(req: Params) {
  // cheap version of _.omit
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {url, accessToken, organizationId, ...nonBase} = req;
  return nonBase;
}
