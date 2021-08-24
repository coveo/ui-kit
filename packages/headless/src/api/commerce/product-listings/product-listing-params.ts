import {FacetOptions} from '../../../features/facet-options/facet-options';
import {AnyFacetRequest} from '../../../features/facets/generic/interfaces/generic-facet-request';
import {
  HTTPContentType,
  HttpMethods,
  PlatformClientCallOptions,
} from '../../platform-client';
import {BaseParam} from '../../platform-service-params';
export type ProductListingsParam = ProductListingBaseParam &
  ProductListingRequestParam;

export type ProductListingBaseParam = Omit<BaseParam, 'url'> & {
  baseClientUrl: string;
};

export type ProductListingRequestParam = {
  url: string;
  clientId?: string;
  additionalFields?: string[];
  advancedParameters?: {
    debug?: boolean;
  };
  facets?: {
    requests: AnyFacetRequest[];
    options?: FacetOptions;
  };
  sort?: {
    by: 'RELEVANCE' | 'FIELDS';
    fields?: [
      {
        direction: 'ASC' | 'DESC';
        name: string;
      }
    ];
  };
};

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
): Pick<
  PlatformClientCallOptions,
  'accessToken' | 'method' | 'contentType' | 'url'
> => {
  const {baseClientUrl, organizationId, accessToken} = req;
  const baseUrl = `${baseClientUrl}/rest/organizations/${organizationId}/commerce/products/listing`;
  const queryString = buildQueryString(queryStringArguments);
  const effectiveUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl;

  return {
    accessToken,
    method,
    contentType,
    url: effectiveUrl,
  };
};

const buildQueryString = (args: Record<string, string>): string => {
  return Object.keys(args)
    .map((argName) => `${argName}=${encodeURIComponent(args[argName])}`)
    .join('&');
};
