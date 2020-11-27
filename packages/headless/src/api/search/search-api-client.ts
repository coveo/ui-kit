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
import {AnalyticsClientSendEventHook} from 'coveo.analytics/dist/definitions/client/analytics';
import {Logger} from 'pino';

export type AllSearchAPIResponse = Plan | Search | QuerySuggest;

export interface AsyncThunkSearchOptions<T extends Partial<SearchAppState>> {
  state: T;
  rejectValue: SearchAPIErrorWithStatusCode;
  extra: {
    searchAPIClient: SearchAPIClient;
    analyticsClientMiddleware: AnalyticsClientSendEventHook;
  };
}

export interface SearchAPIClientOptions {
  renewAccessToken: () => Promise<string>;
  logger: Logger;
  preprocessRequest: PreprocessRequestMiddleware;
}

export type SearchAPIClientResponse<T> =
  | {success: T}
  | {error: SearchAPIErrorWithStatusCode};

export class SearchAPIClient {
  constructor(private options: SearchAPIClientOptions) {}

  async plan(
    req: PlanRequest
  ): Promise<SearchAPIClientResponse<PlanResponseSuccess>> {
    const platformResponse = await PlatformClient.call<
      PlanRequest,
      PlanResponseSuccess
    >({
      ...baseSearchRequest(req, 'POST', 'application/json', '/plan'),
      requestParams: pickNonBaseParams(req) as PlanRequest, // TODO: This cast won't be needed once all methods have been reworked and we can change types in PlatformClient
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
      QuerySuggestRequest,
      QuerySuggestSuccessResponse
    >({
      ...baseSearchRequest(req, 'POST', 'application/json', '/querySuggest'),
      requestParams: pickNonBaseParams(req),
      ...this.options,
    });
    if (isSuccessQuerySuggestionsResponse(platformResponse)) {
      return {
        success: platformResponse.body,
      };
    }
    return {
      error: unwrapError(platformResponse),
    };
  }

  async search(
    req: SearchRequest
  ): Promise<SearchAPIClientResponse<SearchResponseSuccess>> {
    const platformResponse = await PlatformClient.call<SearchRequest, Search>({
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

  async facetSearch(req: FacetSearchRequest | CategoryFacetSearchRequest) {
    const platformResponse = await PlatformClient.call<
      FacetSearchRequest,
      FacetSearchResponse
    >({
      ...baseSearchRequest(req, 'POST', 'application/json', '/facet'),
      requestParams: pickNonBaseParams(req),
      ...this.options,
    });

    return platformResponse.body;
  }

  async recommendations(req: RecommendationRequest) {
    const platformResponse = await PlatformClient.call<
      RecommendationRequest,
      Search
    >({
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
    const platformResponse = await PlatformClient.call<
      ProductRecommendationsRequest,
      Search
    >({
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
