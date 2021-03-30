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

export interface ServiceAPIClientOptions {
  renewAccessToken: () => Promise<string>;
  logger: Logger;
}

export type ServiceAPIResponse<TSuccessContent> =
  | ServiceAPISuccessResponse<TSuccessContent>
  | ServiceAPIErrorResponse;

export interface ServiceAPISuccessResponse<TContent> {
  success: TContent;
}

export interface ServiceAPIErrorResponse {
  error: {
    statusCode: number;
    message: string;
    type: string;
  };
}

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

export interface Result {
  clickUri: string;
  excerpt: string;
  fields: Record<string, unknown>;
  hasHtmlVersion: boolean;
  title: string;
  uniqueId: string;
}

export interface SuggestDocumentsSuccessContent {
  documents: Result[];
  totalCount: number;
  responseId: string;
}

export class ServiceAPIClient {
  private caseAssistApi: CaseAssistAPIClient;

  constructor(options: ServiceAPIClientOptions) {
    this.caseAssistApi = new CaseAssistAPIClient(options);
  }

  get caseAssist(): CaseAssistAPIClient {
    return this.caseAssistApi;
  }
}

export class CaseAssistAPIClient {
  private defaultClientHooks = {
    preprocessRequest: NoopPreprocessRequest,
    deprecatedPreprocessRequest: NoopPreprocessRequestMiddleware,
  };

  constructor(private options: ServiceAPIClientOptions) {}

  async classify(
    req: ClassifyParam
  ): Promise<ServiceAPIResponse<ClassifySuccessContent>> {
    const platformResponse = await PlatformClient.call<unknown>({
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

    return platformResponse.response.ok
      ? {success: platformResponse.body as ClassifySuccessContent}
      : ({error: platformResponse.body} as ServiceAPIErrorResponse);
  }

  async suggestDocuments(
    req: SuggestDocumentsParam
  ): Promise<ServiceAPIResponse<SuggestDocumentsSuccessContent>> {
    const platformResponse = await PlatformClient.call<unknown>({
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

    return platformResponse.response.ok
      ? {success: platformResponse.body as SuggestDocumentsSuccessContent}
      : ({error: platformResponse.body} as ServiceAPIErrorResponse);
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
