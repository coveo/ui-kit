import {Logger} from 'pino';
import {
  NoopPreprocessRequestMiddleware,
  PlatformClient,
} from '../../platform-client';
import {PreprocessRequest} from '../../preprocess-request';
import {
  buildClassifyRequest,
  ClassifyRequest,
} from './classify/classify-request';
import {ClassifyResponse} from './classify/classify-response';
import {
  buildSuggestDocumentsRequest,
  SuggestDocumentsRequest,
} from './suggest-documents/suggest-documents-request';
import {SuggestDocumentsResponse} from './suggest-documents/suggest-documents-response';

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
  async classify(
    req: ClassifyRequest
  ): Promise<CaseAssistAPIResponse<ClassifyResponse>> {
    const response = await PlatformClient.call({
      ...buildClassifyRequest(req),
      ...this.options,
      ...this.defaultClientHooks,
    });

    const body = await response.json();
    return response.ok
      ? {success: body as ClassifyResponse}
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
  async suggestDocuments(
    req: SuggestDocumentsRequest
  ): Promise<CaseAssistAPIResponse<SuggestDocumentsResponse>> {
    const response = await PlatformClient.call({
      ...buildSuggestDocumentsRequest(req),
      ...this.options,
      ...this.defaultClientHooks,
    });

    const body = await response.json();
    return response.ok
      ? {
          success: body as SuggestDocumentsResponse,
        }
      : {error: body as CaseAssistAPIErrorStatusResponse};
  }
}
