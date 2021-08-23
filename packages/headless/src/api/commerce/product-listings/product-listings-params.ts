import {HTTPContentType, HttpMethods} from '../../platform-client';
import {BaseParam} from '../../platform-service-params';

export type ProductListingsParam = BaseParam;

/**
 * Builds a base request for calling the Product Listing API.
 *
 * @param req - The Product Listing request parameters.
 * @param method - The HTTP method used to issue the request.
 * @param contentType - The request content type.
 * @param queryStringArguments - The arguments to pass in the query string.
 * @returns The built request information.
 */
export const baseProductListingRequest = (
  req: ProductListingsParam,
  method: HttpMethods,
  contentType: HTTPContentType,
  queryStringArguments: Record<string, string> = {}
) => {
  validateProductListingRequestParams(req);

  const baseUrl = `${req.url}/rest/organizations/${req.organizationId}/commerce/products/listing`;
  const queryString = buildQueryString(queryStringArguments);
  const effectiveUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl;

  return {
    accessToken: req.accessToken,
    method,
    contentType,
    url: effectiveUrl,
  };
};

const validateProductListingRequestParams = (req: ProductListingsParam) => {
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
};

const buildQueryString = (args: Record<string, string>): string => {
  return Object.keys(args)
    .map((argName) => `${argName}=${encodeURIComponent(args[argName])}`)
    .join('&');
};
