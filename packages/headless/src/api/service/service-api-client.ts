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
import {Result} from '../search/search/result';

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
    const platformResponse = await PlatformClient.call<any>({
      ...baseCaseAssistRequest(req, 'POST', 'application/json', '/classify'),
      requestParams: prepareClassifyRequestParams(req),
      ...this.options,
      ...this.defaultClientHooks,
    });

    return platformResponse.response.ok
      ? {success: platformResponse.body}
      : {error: platformResponse.body};
  }

  async suggestDocuments(
    req: SuggestDocumentsParam
  ): Promise<ServiceAPIResponse<SuggestDocumentsSuccessContent>> {
    const platformResponse = await PlatformClient.call<any>({
      ...baseCaseAssistRequest(
        req,
        'POST',
        'application/json',
        '/documents/suggest'
      ),
      requestParams: prepareSuggestDocumentsRequestParams(req),
      ...this.options,
      ...this.defaultClientHooks,
    });

    return platformResponse.response.ok
      ? {success: platformResponse.body}
      : {error: platformResponse.body};
  }
}

const prepareClassifyRequestParams = (req: ClassifyParam) => ({
  visitorId: req.visitorId,
  locale: req.locale,
  fields: prepareSuggestionRequestFields(req.fields),
  debug: req.debug,
});

const prepareSuggestDocumentsRequestParams = (req: SuggestDocumentsParam) => ({
  visitorId: req.visitorId,
  locale: req.locale,
  fields: prepareSuggestionRequestFields(req.fields),
  context: req.context,
  debug: req.debug,
});

const prepareSuggestionRequestFields = (fields: any) => {
  const payload: {[key: string]: {value: string}} = {};

  Object.keys(fields).forEach((fieldName) => {
    const fieldValue = fields[fieldName];
    if (fieldValue)
      payload[fieldName] = {
        value: fieldValue,
      };
  });

  return payload;
};
