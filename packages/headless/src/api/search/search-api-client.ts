import {PlatformClient, PlatformResponse} from '../platform-client';
import {PlanResponseSuccess, Plan} from './plan/plan-response';
import {SearchPageState} from '../../state';
import {
  QuerySuggestSuccessResponse,
  QuerySuggest,
} from './query-suggest/query-suggest-response';
import {baseSearchParams} from './search-api-params';
import {SearchRequest, searchRequestParams} from './search/search-request';
import {
  facetSearchRequestParams,
  FacetSearchRequest,
} from './facet-search/facet-search/facet-search-request';
import {FacetSearchResponse} from './facet-search/api/response';
import {Search, SearchResponseSuccess} from './search/search-response';
import {
  SearchAPIErrorWithStatusCode,
  SearchAPIErrorWithExceptionInBody,
} from './search-api-error-response';
import {PlanRequestParams, planRequestParams} from './plan/plan-request';
import {
  QuerySuggestRequestParams,
  querySuggestRequestParams,
} from './query-suggest/query-suggest-request';

export type AllSearchAPIResponse = Plan | Search | QuerySuggest;

export interface SearchAPIClientOptions<RequestParams> {
  accessToken: string;
  searchApiBaseUrl: string;
  requestParams: RequestParams;
}

export type SearchAPIClientResponse<T> =
  | {success: T}
  | {error: SearchAPIErrorWithStatusCode};

export class SearchAPIClient {
  static async plan(
    state: SearchPageState
  ): Promise<SearchAPIClientResponse<PlanResponseSuccess>> {
    const platformResponse = await PlatformClient.call<
      PlanRequestParams,
      PlanResponseSuccess
    >({
      ...baseSearchParams(state, 'POST', 'application/json', '/plan'),
      requestParams: planRequestParams(state),
    });

    if (isSuccessPlanResponse(platformResponse)) {
      return {success: platformResponse.body};
    }
    return {
      error: unwrapError(platformResponse)!,
    };
  }

  static async querySuggest(
    id: string,
    state: SearchPageState
  ): Promise<SearchAPIClientResponse<QuerySuggestSuccessResponse>> {
    const platformResponse = await PlatformClient.call<
      QuerySuggestRequestParams,
      QuerySuggestSuccessResponse
    >({
      ...baseSearchParams(state, 'POST', 'application/json', '/querySuggest'),
      requestParams: querySuggestRequestParams(id, state),
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

  static async search(
    state: SearchPageState
  ): Promise<SearchAPIClientResponse<SearchResponseSuccess>> {
    const platformResponse = await PlatformClient.call<SearchRequest, Search>({
      ...baseSearchParams(state, 'POST', 'application/json', ''),
      requestParams: searchRequestParams(state),
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

  static async facetSearch(id: string, state: SearchPageState) {
    const res = await PlatformClient.call<
      FacetSearchRequest,
      FacetSearchResponse
    >({
      ...baseSearchParams(state, 'POST', 'application/json', '/facet'),
      requestParams: facetSearchRequestParams(id, state),
    });

    return res.body;
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
