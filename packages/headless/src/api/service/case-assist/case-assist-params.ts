import {HTTPContentType, HttpMethods} from '../../platform-client';
import {BaseParam} from '../../platform-service-params';

export interface CaseAssistIdParam {
  caseAssistId: string;
}

export interface FieldsParam {
  fields: Record<string, string>;
}

export type CaseAssistParam = BaseParam & CaseAssistIdParam;

/**
 * Builds a base request for calling the Case Assist API.
 *
 * @param req - The Case Assist request parameters.
 * @param method - The HTTP method used to issue the request.
 * @param contentType - The request content type.
 * @param path - The request path, relative to the Case Assist path.
 * @param queryStringArguments - The arguments to pass in the query string.
 * @returns The built request information.
 */
export const baseCaseAssistRequest = (
  req: CaseAssistParam,
  method: HttpMethods,
  contentType: HTTPContentType,
  path: string,
  queryStringArguments: Record<string, string> = {}
) => {
  validateCaseAssistRequestParams(req);

  const baseUrl = `${req.url}/rest/organizations/${req.organizationId}/caseassists/${req.caseAssistId}${path}`;
  const queryString = buildQueryString(queryStringArguments);
  const effectiveUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl;

  return {
    accessToken: req.accessToken,
    method,
    contentType,
    url: effectiveUrl,
  };
};

export const prepareSuggestionRequestFields = (
  fields: Record<string, string>
) =>
  Object.keys(fields)
    .filter((fieldName) => fields[fieldName] !== '')
    .reduce(
      (result, fieldName) => ({
        ...result,
        [fieldName]: {
          value: fields[fieldName],
        },
      }),
      {} as Record<string, unknown>
    );

const validateCaseAssistRequestParams = (req: CaseAssistParam) => {
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

const buildQueryString = (args: Record<string, string>): string => {
  return Object.keys(args)
    .map((argName) => `${argName}=${encodeURIComponent(args[argName])}`)
    .join('&');
};
