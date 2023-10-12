import {Logger} from 'pino';
import {AsyncThunkOptions} from '../../../app/async-thunk-options.js';
import {ClientThunkExtraArguments} from '../../../app/thunk-extra-arguments.js';
import {InsightAppState} from '../../../state/insight-app-state.js';
import {PlatformClient} from '../../platform-client.js';
import {PreprocessRequest} from '../../preprocess-request.js';
import {QuerySuggestSuccessResponse} from '../../search/query-suggest/query-suggest-response.js';
import {
  isSuccessSearchResponse,
  SearchOptions,
  shimResponse,
} from '../../search/search-api-client.js';
import {buildAPIResponseFromErrorOrThrow} from '../../search/search-api-error-response.js';
import {SearchResponseSuccess} from '../../search/search/search-response.js';
import {
  buildGetInsightInterfaceConfigRequest,
  GetInsightInterfaceConfigRequest,
} from './get-interface/get-interface-config-request.js';
import {GetInsightInterfaceConfigResponse} from './get-interface/get-interface-config-response.js';
import {InsightQuerySuggestRequest} from './query-suggest/query-suggest-request.js';
import {
  buildInsightQueryRequest,
  buildInsightQuerySuggestRequest,
  InsightQueryRequest,
} from './query/query-request.js';
import {
  buildInsightUserActionsRequest,
  InsightUserActionsRequest,
} from './user-actions/user-actions-request.js';
import {InsightUserActionsResponse} from './user-actions/user-actions-response.js';

/**
 * Initialization options for the `InsightAPIClient`.
 */
export interface InsightAPIClientOptions {
  logger: Logger;
  preprocessRequest: PreprocessRequest;
}

export interface AsyncThunkInsightOptions<T extends Partial<InsightAppState>>
  extends AsyncThunkOptions<T, ClientThunkExtraArguments<InsightAPIClient>> {
  rejectValue: InsightAPIErrorStatusResponse;
}

export type InsightAPIResponse<TSuccessContent> =
  | InsightAPISuccessResponse<TSuccessContent>
  | InsightAPIErrorResponse;

export interface InsightAPISuccessResponse<TContent> {
  success: TContent;
}

export interface InsightAPIErrorStatusResponse {
  statusCode: number;
  message: string;
  type: string;
  ignored?: boolean;
}

export interface InsightAPIErrorResponse {
  error: InsightAPIErrorStatusResponse;
}

/**
 * The client to use to interact with the Insight API.
 */
export class InsightAPIClient {
  constructor(private options: InsightAPIClientOptions) {}

  async getInterface(
    req: GetInsightInterfaceConfigRequest
  ): Promise<InsightAPIResponse<GetInsightInterfaceConfigResponse>> {
    const response = await PlatformClient.call({
      ...buildGetInsightInterfaceConfigRequest(req),
      ...this.options,
    });

    if (response instanceof Error) {
      return buildAPIResponseFromErrorOrThrow(response);
    }

    const body = await response.json();
    return response.ok
      ? {success: body as GetInsightInterfaceConfigResponse}
      : {error: body as InsightAPIErrorStatusResponse};
  }

  async query(
    req: InsightQueryRequest,
    options?: SearchOptions
  ): Promise<InsightAPIResponse<SearchResponseSuccess>> {
    const response = await PlatformClient.call({
      ...buildInsightQueryRequest(req),
      requestMetadata: {method: 'search', origin: options?.origin},
      ...this.options,
    });

    if (response instanceof Error) {
      return buildAPIResponseFromErrorOrThrow(response);
    }

    let body = await response.json();

    if (isSuccessSearchResponse(body)) {
      body = shimResponse(body);
    }
    return response.ok
      ? {success: body as SearchResponseSuccess}
      : {error: body as InsightAPIErrorStatusResponse};
  }

  async querySuggest(
    req: InsightQuerySuggestRequest
  ): Promise<InsightAPIResponse<QuerySuggestSuccessResponse>> {
    const response = await PlatformClient.call({
      ...buildInsightQuerySuggestRequest(req),
      ...this.options,
    });

    if (response instanceof Error) {
      return buildAPIResponseFromErrorOrThrow(response);
    }

    const body = await response.json();

    return body.completions
      ? {success: body}
      : {error: body as InsightAPIErrorStatusResponse};
  }

  async userActions(
    req: InsightUserActionsRequest
  ): Promise<InsightAPIResponse<InsightUserActionsResponse>> {
    const response = await PlatformClient.call({
      ...buildInsightUserActionsRequest(req),
      ...this.options,
    });

    if (response instanceof Error) {
      return buildAPIResponseFromErrorOrThrow(response);
    }

    const body = await response.json();
    return response.ok
      ? {success: body as InsightUserActionsResponse}
      : {error: body as InsightAPIErrorStatusResponse};
  }
}
