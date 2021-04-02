import {
  NoopPreprocessRequestMiddleware,
  PlatformClient,
} from '../platform-client';
import {NoopPreprocessRequest} from '../preprocess-request';
import {Logger} from 'pino';
import {
  baseCaseAssistRequest,
  ClassifyParam,
  SuggestDocumentsParam,
} from './service-api-params';

/**
 * Initialization options for the `ServiceAPIClient`.
 */
export interface ServiceAPIClientOptions {
  renewAccessToken: () => Promise<string>;
  logger: Logger;
}

/**
 * Defines a Service API response. It can represent an error or a successful response.
 */
export type ServiceAPIResponse<TSuccessContent> =
  | ServiceAPISuccessResponse<TSuccessContent>
  | ServiceAPIErrorResponse;

/**
 * Defines a Service API successful response.
 */
export interface ServiceAPISuccessResponse<TContent> {
  success: TContent;
}

/**
 * Defines a Service API error response.
 */
export interface ServiceAPIErrorResponse {
  error: {
    statusCode: number;
    message: string;
    type: string;
  };
}

/**
 * Defines the content of a successful response from the `/classify` call.
 *
 * See  https://platform.cloud.coveo.com/docs?urls.primaryName=Customer%20Service#/Suggestions/postClassify
 */
export interface ClassifySuccessContent {
  fields: {
    [fieldName: string]: {
      predictions: [
        {
          id: string;
          value: string;
          confidence: number;
        }
      ];
    };
  };
  responseId: string;
}

/**
 * Defines document suggestion result.
 */
export interface Result {
  clickUri: string;
  excerpt: string;
  fields: Record<string, unknown>;
  hasHtmlVersion: boolean;
  title: string;
  uniqueId: string;
}

/**
 * Defines the content of a successful response from the `/documents/suggest` API call.
 *
 * See https://platform.cloud.coveo.com/docs?urls.primaryName=Customer%20Service#/Suggestions/getSuggestDocument
 */
export interface SuggestDocumentsSuccessContent {
  documents: Result[];
  totalCount: number;
  responseId: string;
}

/**
 * The client to use to interact with the Customer Service API.
 */
export class ServiceAPIClient {
  private caseAssistApi: CaseAssistAPIClient;

  constructor(options: ServiceAPIClientOptions) {
    this.caseAssistApi = new CaseAssistAPIClient(options);
  }

  /**
   * Gets the client for Case Assist specific calls.
   */
  get caseAssist(): CaseAssistAPIClient {
    return this.caseAssistApi;
  }
}

/**
 * The client to use to interface with the Case Assist API.
 */
export class CaseAssistAPIClient {
  private defaultClientHooks = {
    preprocessRequest: NoopPreprocessRequest,
    deprecatedPreprocessRequest: NoopPreprocessRequestMiddleware,
  };

  constructor(private options: ServiceAPIClientOptions) {}

  /**
   * Retrieves the case classifications from the API.
   *
   * See https://platform.cloud.coveo.com/docs?urls.primaryName=Customer%20Service#/Suggestions/postClassify
   *
   * @param req - The request parameters.
   * @returns The case classifications grouped by fields for the given case information.
   */
  async classify(
    req: ClassifyParam
  ): Promise<ServiceAPIResponse<ClassifySuccessContent>> {
    const platformResponse = await PlatformClient.call({
      ...baseCaseAssistRequest(
        req,
        'POST',
        'application/json',
        '/classify',
        req.debug
      ),
      requestParams: prepareClassifyRequestParams(req),
      ...this.options,
      ...this.defaultClientHooks,
    });

    return platformResponse.ok
      ? {success: (await platformResponse.json()) as ClassifySuccessContent}
      : ({error: await platformResponse.json()} as ServiceAPIErrorResponse);
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
    req: SuggestDocumentsParam
  ): Promise<ServiceAPIResponse<SuggestDocumentsSuccessContent>> {
    const platformResponse = await PlatformClient.call({
      ...baseCaseAssistRequest(
        req,
        'POST',
        'application/json',
        '/documents/suggest',
        req.debug
      ),
      requestParams: prepareSuggestDocumentsRequestParams(req),
      ...this.options,
      ...this.defaultClientHooks,
    });

    return platformResponse.ok
      ? {
          success: (await platformResponse.json()) as SuggestDocumentsSuccessContent,
        }
      : ({error: await platformResponse.json()} as ServiceAPIErrorResponse);
  }
}

const prepareClassifyRequestParams = (req: ClassifyParam) => ({
  visitorId: req.visitorId,
  locale: req.locale,
  fields: prepareSuggestionRequestFields(req.fields),
});

const prepareSuggestDocumentsRequestParams = (req: SuggestDocumentsParam) => ({
  visitorId: req.visitorId,
  locale: req.locale,
  fields: prepareSuggestionRequestFields(req.fields),
  context: req.context,
});

const prepareSuggestionRequestFields = (fields: Record<string, string>) =>
  Object.keys(fields)
    .filter((fieldName) => new Boolean(fields[fieldName]))
    .reduce(
      (result, fieldName) => ({
        ...result,
        [fieldName]: {
          value: fields[fieldName],
        },
      }),
      {} as Record<string, unknown>
    );
