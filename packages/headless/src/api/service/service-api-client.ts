import {
  NoopPreprocessRequestMiddleware,
  PlatformClient,
} from '../platform-client';
import {NoopPreprocessRequest} from '../preprocess-request';
import {Logger} from 'pino';
import {baseCaseAssistRequest, ClassifyParam} from './service-api-params';

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

export class ServiceAPIClient {
  private defaultClientHooks = {
    preprocessRequest: NoopPreprocessRequest,
    deprecatedPreprocessRequest: NoopPreprocessRequestMiddleware,
  };

  constructor(private options: ServiceAPIClientOptions) {}

  // TODO: figure out all the typing stuff once the call works
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
}

const prepareClassifyRequestParams = (req: ClassifyParam) => ({
  visitorId: req.visitorId,
  locale: req.locale,
  fields: prepareClassifyRequestFields(req.fields),
  context: req.context,
});

const prepareClassifyRequestFields = (fields: any) => {
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
