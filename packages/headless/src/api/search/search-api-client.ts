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
} from './search-api-error-response';
import {PlanRequest} from './plan/plan-request';
import {QuerySuggestRequest} from './query-suggest/query-suggest-request';
import {FacetSearchRequest} from './facet-search/facet-search-request';
import {SearchAppState} from '../../state/search-app-state';
import {BaseParam, baseSearchRequest} from './search-api-params';
import {RecommendationRequest} from './recommendation/recommendation-request';
import {ProductRecommendationsRequest} from './product-recommendations/product-recommendations-request';
import {Logger} from 'pino';
import {ThunkExtraArguments} from '../../app/store';
import {
  PostprocessFacetSearchResponseMiddleware,
  PostprocessQuerySuggestResponseMiddleware,
  PostprocessSearchResponseMiddleware,
} from './search-api-client-middleware';
import {PreprocessRequest} from '../preprocess-request';
import {HtmlRequest} from './html/html-request';

export type AllSearchAPIResponse = Plan | Search | QuerySuggest;

export interface AsyncThunkSearchOptions<T extends Partial<SearchAppState>> {
  state: T;
  rejectValue: SearchAPIErrorWithStatusCode;
  extra: ThunkExtraArguments;
}

export interface SearchAPIClientOptions {
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

    const body = await response.text();

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

    const body = await response.json();

    if (isSuccessSearchResponse(response)) {
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

const unwrapError = (res: PlatformResponse<AllSearchAPIResponse>) => {
  if (isException(res)) {
    return unwrapByBodyException(res);
  }
  if (isError(res)) {
    return unwrapByStatusCode(res);
  }

  return {message: 'unknown', statusCode: 0, type: 'unknown'};
};

const unwrapByBodyException = (
  res: PlatformResponse<SearchAPIErrorWithExceptionInBody>
) => ({
  message: res.body.exception.code,
  statusCode: res.response.status,
  type: res.body.exception.code,
});

const unwrapByStatusCode = (
  res: PlatformResponse<SearchAPIErrorWithStatusCode>
) => ({
  message: res.body.message,
  statusCode: res.body.statusCode,
  type: res.body.type,
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

function isError(
  r: PlatformResponse<AllSearchAPIResponse>
): r is PlatformResponse<SearchAPIErrorWithStatusCode> {
  return (
    (r as PlatformResponse<SearchAPIErrorWithStatusCode>).body.statusCode !==
    undefined
  );
}

function isException(
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
