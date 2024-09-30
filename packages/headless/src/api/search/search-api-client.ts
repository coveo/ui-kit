import {isNullOrUndefined} from '@coveo/bueno';
import {AsyncThunkOptions} from '../../app/async-thunk-options.js';
import {ClientThunkExtraArguments} from '../../app/thunk-extra-arguments.js';
import {emptyQuestionAnswer} from '../../features/search/search-state.js';
import {SearchAppState} from '../../state/search-app-state.js';
import {pickNonBaseParams, unwrapError} from '../api-client-utils.js';
import {PlatformClient} from '../platform-client.js';
import {BaseParam} from '../platform-service-params.js';
import {APICallsQueue} from './api-calls-queue.js';
import {FacetSearchRequest} from './facet-search/facet-search-request.js';
import {FacetSearchResponse} from './facet-search/facet-search-response.js';
import {
  FieldDescription,
  FieldDescriptionsResponseSuccess,
} from './fields/fields-response.js';
import {getHtml, HtmlAPIClientOptions} from './html/html-api-client.js';
import {HtmlRequest} from './html/html-request.js';
import {PlanRequest} from './plan/plan-request.js';
import {PlanResponseSuccess, Plan} from './plan/plan-response.js';
import {QuerySuggestRequest} from './query-suggest/query-suggest-request.js';
import {
  QuerySuggestSuccessResponse,
  QuerySuggest,
} from './query-suggest/query-suggest-response.js';
import {RecommendationRequest} from './recommendation/recommendation-request.js';
import {
  PostprocessFacetSearchResponseMiddleware,
  PostprocessQuerySuggestResponseMiddleware,
  PostprocessSearchResponseMiddleware,
} from './search-api-client-middleware.js';
import {
  SearchAPIErrorWithStatusCode,
  buildAPIResponseFromErrorOrThrow,
} from './search-api-error-response.js';
import {baseSearchRequest} from './search-api-params.js';
import {SearchOrigin} from './search-metadata.js';
import {SearchRequest} from './search/search-request.js';
import {Search, SearchResponseSuccess} from './search/search-response.js';

export interface FacetSearchAPIClient {
  facetSearch(req: FacetSearchRequest): Promise<FacetSearchResponse>;
}

export interface SearchOptions {
  disableAbortWarning?: boolean;
  origin: SearchOrigin;
}

export type AllSearchAPIResponse =
  | Plan
  | Search
  | QuerySuggest
  | FieldDescription;

export interface AsyncThunkSearchOptions<T extends Partial<SearchAppState>>
  extends AsyncThunkOptions<T, ClientThunkExtraArguments<SearchAPIClient>> {
  rejectValue: SearchAPIErrorWithStatusCode;
}

export interface SearchAPIClientOptions extends HtmlAPIClientOptions {
  postprocessSearchResponseMiddleware: PostprocessSearchResponseMiddleware;
  postprocessQuerySuggestResponseMiddleware: PostprocessQuerySuggestResponseMiddleware;
  postprocessFacetSearchResponseMiddleware: PostprocessFacetSearchResponseMiddleware;
}

export type SearchAPIClientResponse<T> =
  | {success: T}
  | {error: SearchAPIErrorWithStatusCode};

export class SearchAPIClient implements FacetSearchAPIClient {
  constructor(private options: SearchAPIClientOptions) {}

  async plan(
    req: PlanRequest
  ): Promise<SearchAPIClientResponse<PlanResponseSuccess>> {
    const response = await PlatformClient.call({
      ...baseSearchRequest(req, 'POST', 'application/json', '/plan'),
      requestParams: pickNonBaseParams(req),
      requestMetadata: {method: 'plan'},
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
      requestMetadata: {method: 'querySuggest'},
      requestParams: pickNonBaseParams(req),
      ...this.options,
    });

    if (response instanceof Error) {
      return buildAPIResponseFromErrorOrThrow(response);
    }

    const body = await response.json();
    const payload = {response, body};

    if (isSuccessQuerySuggestionsResponse(body)) {
      const processedResponse =
        await this.options.postprocessQuerySuggestResponseMiddleware(payload);
      return {
        success: processedResponse.body,
      };
    }
    return {
      error: unwrapError(payload),
    };
  }

  private apiCallsQueues: Record<SearchOrigin | 'unknown', APICallsQueue> = {
    unknown: new APICallsQueue(),
    mainSearch: new APICallsQueue(),
    facetValues: new APICallsQueue(),
    foldingCollection: new APICallsQueue(),
    instantResults: new APICallsQueue(),
  };

  async search(
    req: SearchRequest,
    options?: SearchOptions
  ): Promise<SearchAPIClientResponse<SearchResponseSuccess>> {
    const origin = options?.origin ?? 'unknown';

    const response = await this.apiCallsQueues[origin].enqueue(
      (signal) =>
        PlatformClient.call({
          ...baseSearchRequest(req, 'POST', 'application/json', ''),
          requestParams: pickNonBaseParams(req),
          requestMetadata: {method: 'search', origin: options?.origin},
          ...this.options,
          signal: signal ?? undefined,
        }),
      {logger: this.options.logger, warnOnAbort: !options?.disableAbortWarning}
    );

    if (response instanceof Error) {
      return buildAPIResponseFromErrorOrThrow(
        response,
        options?.disableAbortWarning
      );
    }

    const body = await response.json();
    const payload = {response, body};

    if (isSuccessSearchResponse(body)) {
      payload.body = shimResponse(body);
      const processedResponse =
        await this.options.postprocessSearchResponseMiddleware(payload);
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
      requestMetadata: {method: 'facetSearch'},
      ...this.options,
    });

    if (response instanceof Error) {
      throw response;
    }

    const body = await response.json();
    const payload = {response, body};

    const processedResponse =
      await this.options.postprocessFacetSearchResponseMiddleware(payload);

    return processedResponse.body;
  }

  async recommendations(req: RecommendationRequest) {
    const response = await PlatformClient.call({
      ...baseSearchRequest(req, 'POST', 'application/json', ''),
      requestParams: pickNonBaseParams(req),
      requestMetadata: {method: 'recommendations'},
      ...this.options,
    });

    if (response instanceof Error) {
      throw response;
    }

    const body = await response.json();

    if (isSuccessSearchResponse(body)) {
      const payload = {response, body};
      payload.body = shimResponse(body);
      const processedResponse =
        await this.options.postprocessSearchResponseMiddleware(payload);
      return {
        success: processedResponse.body,
      };
    }

    return {
      error: unwrapError({response, body}),
    };
  }

  async html(req: HtmlRequest) {
    return getHtml(req, {...this.options});
  }

  async fieldDescriptions(req: BaseParam) {
    const response = await PlatformClient.call({
      ...baseSearchRequest(req, 'GET', 'application/json', '/fields'),
      requestParams: {},
      requestMetadata: {method: 'fieldDescriptions'},
      ...this.options,
    });
    if (response instanceof Error) {
      throw response;
    }
    const body = await response.json();

    if (isSuccessFieldsDescriptionResponse(body)) {
      return {success: body};
    }

    return {
      error: unwrapError({response, body}),
    };
  }
}

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

export function isSuccessSearchResponse(
  body: unknown
): body is SearchResponseSuccess {
  return (body as SearchResponseSuccess).results !== undefined;
}

export function shimResponse(response: SearchResponseSuccess) {
  const empty = emptyQuestionAnswer();
  if (isNullOrUndefined(response.questionAnswer)) {
    response.questionAnswer = empty;
    return response;
  }

  response.questionAnswer = {...empty, ...response.questionAnswer};
  return response;
}

function isSuccessQuerySuggestionsResponse(
  body: unknown
): body is QuerySuggestSuccessResponse {
  return (body as QuerySuggestSuccessResponse).completions !== undefined;
}

function isSuccessPlanResponse(body: unknown): body is PlanResponseSuccess {
  return (body as PlanResponseSuccess).preprocessingOutput !== undefined;
}

function isSuccessFieldsDescriptionResponse(
  body: unknown
): body is FieldDescriptionsResponseSuccess {
  return (body as FieldDescriptionsResponseSuccess).fields !== undefined;
}
