import {HTTPContentTypes, HttpMethods} from '../platform-client';

export interface BaseParam {
  url: string;
  accessToken: string;
  organizationId: string;
}

export interface BaseCaseAssistParam extends BaseParam {
  caseAssistId: string;
}

export interface ClassifyParam extends BaseCaseAssistParam {
  visitorId: string;
  locale?: string;
  fields: {[name: string]: string};
  context?: {[key: string]: any};
  debug?: boolean;
}

export const baseCaseAssistRequest = (
  req: BaseCaseAssistParam,
  method: HttpMethods,
  contentType: HTTPContentTypes,
  path: string
) => ({
  accessToken: req.accessToken,
  method,
  contentType,
  url: `${req.url}/rest/organizations/${req.organizationId}/caseassists/${req.caseAssistId}${path}`,
});
