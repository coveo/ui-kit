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
import {FacetSearchResponse} from './facet-search/facet-search-response';
import {SearchAppState} from '../../state/search-app-state';
import {BaseParam, baseSearchRequest} from './search-api-params';
import {CategoryFacetSearchRequest} from './facet-search/category-facet-search/category-facet-search-request';
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
    const platformResponse = await PlatformClient.call<PlanResponseSuccess>({
      ...baseSearchRequest(req, 'POST', 'application/json', '/plan'),
      requestParams: pickNonBaseParams(req),
      ...this.options,
    });

    if (isSuccessPlanResponse(platformResponse)) {
      return {success: platformResponse.body};
    }
    return {
      error: unwrapError(platformResponse)!,
    };
  }

  async querySuggest(
    req: QuerySuggestRequest
  ): Promise<SearchAPIClientResponse<QuerySuggestSuccessResponse>> {
    const platformResponse = await PlatformClient.call<
      QuerySuggestSuccessResponse
    >({
      ...baseSearchRequest(req, 'POST', 'application/json', '/querySuggest'),
      requestParams: pickNonBaseParams(req),
      ...this.options,
    });
    if (isSuccessQuerySuggestionsResponse(platformResponse)) {
      const processedResponse = await this.options.postprocessQuerySuggestResponseMiddleware(
        platformResponse
      );
      return {
        success: processedResponse.body,
      };
    }
    return {
      error: unwrapError(platformResponse),
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

    const platformResponse = await PlatformClient.call<Search>({
      ...baseSearchRequest(req, 'POST', 'application/json', ''),
      requestParams: pickNonBaseParams(req),
      ...this.options,
      signal: this.searchAbortController?.signal,
    });

    this.searchAbortController = null;

    if (isSuccessSearchResponse(platformResponse)) {
      const processedResponse = await this.options.postprocessSearchResponseMiddleware(
        platformResponse
      );
      return {
        success: processedResponse.body,
      };
    }

    return {
      error: unwrapError(platformResponse),
    };
  }

  async facetSearch(req: FacetSearchRequest | CategoryFacetSearchRequest) {
    const platformResponse = await PlatformClient.call<FacetSearchResponse>({
      ...baseSearchRequest(req, 'POST', 'application/json', '/facet'),
      requestParams: pickNonBaseParams(req),
      ...this.options,
    });
    const processedResponse = await this.options.postprocessFacetSearchResponseMiddleware(
      platformResponse
    );

    return processedResponse.body;
  }

  async recommendations(req: RecommendationRequest) {
    const platformResponse = await PlatformClient.call<Search>({
      ...baseSearchRequest(req, 'POST', 'application/json', ''),
      requestParams: pickNonBaseParams(req),
      ...this.options,
    });

    if (isSuccessSearchResponse(platformResponse)) {
      return {
        success: platformResponse.body,
      };
    }

    return {
      error: unwrapError(platformResponse),
    };
  }

  async productRecommendations(req: ProductRecommendationsRequest) {
    const platformResponse = await PlatformClient.call<Search>({
      ...baseSearchRequest(req, 'POST', 'application/json', ''),
      requestParams: pickNonBaseParams(req),
      ...this.options,
    });

    if (isSuccessSearchResponse(platformResponse)) {
      return {
        success: platformResponse.body,
      };
    }

    return {
      error: unwrapError(platformResponse),
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
  res: PlatformResponse<AllSearchAPIResponse>
): SearchAPIErrorWithStatusCode => {
  if (isSearchAPIException(res)) {
    return unwrapErrorByException(res);
  }
  if (isSearchAPIErrorWithStatusCode(res)) {
    return res.body;
  }

  return {
    message: '',
    statusCode: 400,
    type: 'ClientError',
    ...res.body,
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
  r: PlatformResponse<QuerySuggest>
): r is PlatformResponse<QuerySuggestSuccessResponse> {
  return (
    (r as PlatformResponse<QuerySuggestSuccessResponse>).body.completions !==
    undefined
  );
}

function isSuccessPlanResponse(
  r: PlatformResponse<Plan>
): r is PlatformResponse<PlanResponseSuccess> {
  return (
    (r as PlatformResponse<PlanResponseSuccess>).body.preprocessingOutput !==
    undefined
  );
}

function isSuccessSearchResponse(
  r: PlatformResponse<Search>
): r is PlatformResponse<SearchResponseSuccess> {
  return (
    (r as PlatformResponse<SearchResponseSuccess>).body.results !== undefined
  );
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
