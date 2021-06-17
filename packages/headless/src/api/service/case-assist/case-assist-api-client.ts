import {Logger} from 'pino';
import {PlatformClient} from '../../platform-client';
import {PreprocessRequest} from '../../preprocess-request';
import {buildAPIResponseFromErrorOrThrow} from '../../search/search-api-error-response';
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
    });

    if (response instanceof Error) {
      return buildAPIResponseFromErrorOrThrow(response);
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
    });

    if (response instanceof Error) {
      return buildAPIResponseFromErrorOrThrow(response);
    }

    const body = await response.json();
    return response.ok
      ? {
          success: body as GetDocumentSuggestionsResponse,
        }
      : {error: body as CaseAssistAPIErrorStatusResponse};
  }
}
