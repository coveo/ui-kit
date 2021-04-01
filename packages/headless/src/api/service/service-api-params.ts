import {HTTPContentTypes, HttpMethods} from '../platform-client';

/**
 * Defines the request parameters required for all Customer Service API calls.
 */
export interface BaseParam {
  url: string;
  accessToken: string;
  organizationId: string;
}

/**
 * Defines the request parameters required for all Case Assist API calls.
 */
export interface BaseCaseAssistParam extends BaseParam {
  caseAssistId: string;
}

/**
 * Defines the request parameters required to retrieve case classifications.
 */
export interface ClassifyParam extends BaseCaseAssistParam {
  visitorId: string;
  locale?: string;
  fields: Record<string, string>;
  debug: boolean;
}

/**
 * Defines the request parameters required to retrieve case document suggestions.
 */
export interface SuggestDocumentsParam extends BaseCaseAssistParam {
  visitorId: string;
  locale?: string;
  fields: Record<string, string>;
  context?: Record<string, string>;
  debug: boolean;
}

/**
 * Builds a base request for calling the Case Assist API.
 *
 * @param req - The Case Assist request parameters.
 * @param method - The HTTP method used to issue the request.
 * @param contentType - The request content type.
 * @param path - The request path, relative to the Case Assist path.
 * @param debug - Whether to retrieve debug information.
 * @returns The built request information.
 */
export const baseCaseAssistRequest = (
  req: BaseCaseAssistParam,
  method: HttpMethods,
  contentType: HTTPContentTypes,
  path: string,
  debug: boolean
) => {
  validateCaseAssistRequestParams(req);
  let callUrl = `${req.url}/rest/organizations/${req.organizationId}/caseassists/${req.caseAssistId}${path}`;
  if (debug) {
    callUrl += '?debug=1';
  }

  return {
    accessToken: req.accessToken,
    method,
    contentType,
    url: callUrl,
  };
};

const validateCaseAssistRequestParams = (req: BaseCaseAssistParam) => {
  if (!req.url) {
    throw new Error("The 'url' attribute must contain a valid platform URL.");
  }
  if (!req.organizationId) {
    throw new Error(
      "The 'organizationId' attribute must contain a valid organization ID."
    );
  }
  if (!req.accessToken) {
    throw new Error(
      "The 'accessToken' attribute must contain a valid platform access token."
    );
  }
  if (!req.caseAssistId) {
    throw new Error(
      "The 'caseAssistId' attribute must contain a valid Case Assist configuration ID."
    );
  }
};
