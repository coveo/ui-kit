import {PlatformClient} from '../platform-client';
import {PlanResponseSuccess, Plan} from './plan/plan-response';
import {
  QuerySuggestSuccessResponse,
  QuerySuggest,
} from './query-suggest/query-suggest-response';
import {SearchRequest} from './search/search-request';
import {Search, SearchResponseSuccess} from './search/search-response';
import {
  SearchAPIErrorWithStatusCode,
  buildAPIResponseFromErrorOrThrow,
} from './search-api-error-response';
import {PlanRequest} from './plan/plan-request';
import {QuerySuggestRequest} from './query-suggest/query-suggest-request';
import {FacetSearchRequest} from './facet-search/facet-search-request';
import {SearchAppState} from '../../state/search-app-state';
import {baseSearchRequest} from './search-api-params';
import {RecommendationRequest} from './recommendation/recommendation-request';
import {ProductRecommendationsRequest} from './product-recommendations/product-recommendations-request';
import {
  PostprocessFacetSearchResponseMiddleware,
  PostprocessQuerySuggestResponseMiddleware,
  PostprocessSearchResponseMiddleware,
} from './search-api-client-middleware';
import {HtmlRequest} from './html/html-request';
import {BaseParam} from '../platform-service-params';
import {emptyQuestionAnswer} from '../../features/search/search-state';
import {isNullOrUndefined} from '@coveo/bueno';
import {
  FieldDescription,
  FieldDescriptionsResponseSuccess,
} from './fields/fields-response';
import {AsyncThunkOptions} from '../../app/async-thunk-options';
import {ClientThunkExtraArguments} from '../../app/thunk-extra-arguments';
import {FacetSearchResponse} from './facet-search/facet-search-response';
import {getHtml, HtmlAPIClientOptions} from './html/html-api-client';
import {pickNonBaseParams, unwrapError} from '../api-client-utils';

export interface FacetSearchAPIClient {
  facetSearch(req: FacetSearchRequest): Promise<FacetSearchResponse>;
}

export type AllSearchAPIResponse =
  | Plan
  | Search
  | QuerySuggest
  | FieldDescription;

export interface AsyncThunkSearchOptions<
  T extends Partial<SearchAppState>
> extends AsyncThunkOptions<
    T,
    ClientThunkExtraArguments<SearchAPIClient> & {
      /*
       * @deprecated This property is now unused, please use `apiClient` instead.
       */
      searchAPIClient?: SearchAPIClient;
    }
  > {
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
    return getHtml(req, this.options);
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

  async fieldDescriptions(req: BaseParam) {
    const response = await PlatformClient.call({
      ...baseSearchRequest(req, 'GET', 'application/json', '/fields'),
      requestParams: {},
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

function isSuccessFieldsDescriptionResponse(
  body: unknown
): body is FieldDescriptionsResponseSuccess {
  return (body as FieldDescriptionsResponseSuccess).fields !== undefined;
}

function isSuccessSearchResponse(body: unknown): body is SearchResponseSuccess {
  return (body as SearchResponseSuccess).results !== undefined;
}

function shimResponse(response: SearchResponseSuccess) {
  const empty = emptyQuestionAnswer();
  if (isNullOrUndefined(response.questionAnswer)) {
    response.questionAnswer = empty;
    return response;
  }

  response.questionAnswer = {...empty, ...response.questionAnswer};
  return response;
}
