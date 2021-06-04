import {Logger} from 'pino';
import {DisconnectedError} from '../../../utils/errors';
import {
  NoopPreprocessRequestMiddleware,
  PlatformClient,
} from '../../platform-client';
import {PreprocessRequest} from '../../preprocess-request';
import {buildDisconnectedError} from '../../search/search-api-error-response';
import {
  buildGetCaseClassificationsRequest,
  GetCaseClassificationsRequest,
} from './get-case-classifications/get-case-classifications-request';
import {GetCaseClassificationsResponse} from './get-case-classifications/get-case-classifications-response';
import {
  buildGetDocumentSuggestionsRequest,
  GetDocumentSuggestionsRequest,
} from './get-document-suggestions/get-document-suggestions-request';
import {GetDocumentSuggestionsResponse} from './get-document-suggestions/get-document-suggestions-response';

/**
 * Initialization options for the `CaseAssistAPIClient`.
 */
export interface CaseAssistAPIClientOptions {
  logger: Logger;
  preprocessRequest: PreprocessRequest;
  renewAccessToken: () => Promise<string>;
}

/**
 * Defines a Case Assist API response. It can represent an error or a successful response.
 */
export type CaseAssistAPIResponse<TSuccessContent> =
  | CaseAssistAPISuccessResponse<TSuccessContent>
  | CaseAssistAPIErrorResponse;

/**
 * Defines a Case Assist API successful response.
 */
export interface CaseAssistAPISuccessResponse<TContent> {
  success: TContent;
}

/**
 * Defines the content of a Case Assist API error response.
 */
export interface CaseAssistAPIErrorStatusResponse {
  statusCode: number;
  message: string;
  type: string;
}

/**
 * Defines a Case Assist API error response.
 */
export interface CaseAssistAPIErrorResponse {
  error: CaseAssistAPIErrorStatusResponse;
}

/**
 * The client to use to interface with the Case Assist API.
 */
export class CaseAssistAPIClient {
  private defaultClientHooks = {
    deprecatedPreprocessRequest: NoopPreprocessRequestMiddleware,
  };

  constructor(private options: CaseAssistAPIClientOptions) {}

  /**
   * Retrieves the case classifications from the API.
   *
   * See https://platform.cloud.coveo.com/docs?urls.primaryName=Customer%20Service#/Suggestions/postClassify
   *
   * @param req - The request parameters.
   * @returns The case classifications grouped by fields for the given case information.
   */
  async getCaseClassifications(
    req: GetCaseClassificationsRequest
  ): Promise<CaseAssistAPIResponse<GetCaseClassificationsResponse>> {
    const response = await PlatformClient.call({
      ...buildGetCaseClassificationsRequest(req),
      ...this.options,
      ...this.defaultClientHooks,
    });

    if (response instanceof Error) {
      if (response instanceof DisconnectedError) {
        return {error: buildDisconnectedError()};
      }
      throw response;
    }

    const body = await response.json();
    return response.ok
      ? {success: body as GetCaseClassificationsResponse}
      : {error: body as CaseAssistAPIErrorStatusResponse};
  }

  /**
   * Retrieves the document suggestions from the API.
   *
   * See https://platform.cloud.coveo.com/docs?urls.primaryName=Customer%20Service#/Suggestions/getSuggestDocument
   *
   * @param req - The request parameters.
   * @returns The document suggestions for the given case information and context.
   */
  async getDocumentSuggestions(
    req: GetDocumentSuggestionsRequest
  ): Promise<CaseAssistAPIResponse<GetDocumentSuggestionsResponse>> {
    const response = await PlatformClient.call({
      ...buildGetDocumentSuggestionsRequest(req),
      ...this.options,
      ...this.defaultClientHooks,
    });

    if (response instanceof Error) {
      if (response instanceof DisconnectedError) {
        return {error: buildDisconnectedError()};
      }
      throw response;
    }

    const body = await response.json();
    return response.ok
      ? {
          success: body as GetDocumentSuggestionsResponse,
        }
      : {error: body as CaseAssistAPIErrorStatusResponse};
  }
}
