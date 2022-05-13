import {Logger} from 'pino';
import {PlatformClient} from '../../platform-client';
import {PreprocessRequest} from '../../preprocess-request';
import {buildAPIResponseFromErrorOrThrow} from '../../search/search-api-error-response';
import {
  buildGetInsightInterfaceRequest,
  GetInsightInterfaceRequest,
} from './get-interface/get-interface-request';
import {GetInsightInterfaceResponse} from './get-interface/get-interface-response';
import {
  buildInsightQueryRequest,
  InsightQueryRequest,
} from './query/query-request';
import {InsightQueryResponse} from './query/query-response';
import {
  buildInsightUserActionsRequest,
  InsightUserActionsRequest,
} from './user-actions/user-actions-request';
import {InsightUserActionsResponse} from './user-actions/user-actions-response';

/**
 * Initialization options for the `InsightAPIClient`.
 */
interface InsightAPIClientOptions {
  logger: Logger;
  preprocessRequest: PreprocessRequest;
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
    req: GetInsightInterfaceRequest
  ): Promise<InsightAPIResponse<GetInsightInterfaceResponse>> {
    const response = await PlatformClient.call({
      ...buildGetInsightInterfaceRequest(req),
      ...this.options,
    });

    if (response instanceof Error) {
      return buildAPIResponseFromErrorOrThrow(response);
    }

    const body = await response.json();
    return response.ok
      ? {success: body as GetInsightInterfaceResponse}
      : {error: body as InsightAPIErrorStatusResponse};
  }

  async query(
    req: InsightQueryRequest
  ): Promise<InsightAPIResponse<InsightQueryResponse>> {
    const response = await PlatformClient.call({
      ...buildInsightQueryRequest(req),
      ...this.options,
    });

    if (response instanceof Error) {
      return buildAPIResponseFromErrorOrThrow(response);
    }

    const body = await response.json();
    return response.ok
      ? {success: body as InsightQueryResponse}
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
