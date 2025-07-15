import type {
  HTTPContentType,
  HttpMethods,
  PlatformClientCallOptions,
} from '../../platform-client.js';
import type {BaseParam} from '../../platform-service-params.js';

export interface CaseAssistIdParam {
  caseAssistId: string;
}

type CaseFields = {
  [fieldName: string]: {
    value: string;
  };
};

export interface FieldsParam {
  fields: CaseFields;
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
): Pick<
  PlatformClientCallOptions,
  'accessToken' | 'method' | 'contentType' | 'url' | 'origin'
> => {
  validateCaseAssistRequestParams(req);

  const baseUrl = `${req.url}/rest/organizations/${req.organizationId}/caseassists/${req.caseAssistId}${path}`;
  const queryString = buildQueryString(queryStringArguments);
  const effectiveUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl;

  return {
    accessToken: req.accessToken,
    method,
    contentType,
    url: effectiveUrl,
    origin: 'caseAssistApiFetch',
  };
};

export const prepareSuggestionRequestFields = (
  fields: CaseFields
): CaseFields =>
  Object.keys(fields)
    .filter((fieldName) => fields[fieldName].value !== '')
    .reduce((obj: CaseFields, fieldName) => {
      obj[fieldName] = fields[fieldName];
      return obj;
    }, {});

export const prepareContextFromFields = (
  fields: CaseFields
): Record<string, string | string[]> =>
  Object.keys(fields)
    .filter((fieldName) => fields[fieldName].value !== '')
    .reduce(
      (obj: Record<string, string | string[]>, fieldName) => {
        obj[fieldName] = fields[fieldName].value;
        return obj;
      },
      {} as Record<string, string | string[]>
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
