import {ContextPayload} from '../../../controllers/product-listing/context/headless-product-listing-context';
import {FacetOptions} from '../../../features/facet-options/facet-options';
import {AnyFacetRequest} from '../../../features/facets/generic/interfaces/generic-facet-request';
import {SortCriterion} from '../../../features/sort/sort';
import {
  HTTPContentType,
  HttpMethods,
  PlatformClientCallOptions,
} from '../../platform-client';

export interface ProductListingsParam
  extends ProductListingBaseParam,
    ProductListingRequestParam {}

export interface ProductListingsV2Param
  extends ProductListingBaseParam,
    ProductListingV2RequestParam {}

export interface ProductListingBaseParam {
  accessToken: string;
  organizationId: string;
  platformUrl: string;
  version?: string;
}

export interface ProductListingRequestParam {
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
  sort?: SortCriterion;
  userContext?: ContextPayload;
}

// TODO: Use interfaces for nested params
export interface ProductListingV2RequestParam {
  listingId: string;
  locale: string;
  mode: string;
  clientId: string;
  selectedFacets?: {
    facetId?: string;
    type?: string;
    field?: string;
    values?: {
      value?: string;
      start?: number | string;
      end?: number | string;
      isInclusive?: boolean;
    }[];
  }[];
  selectedPage?: {
    page?: number;
  };
  selectedSort?: SortCriterion;
  context: {
    user: {
      userId?: string;
      email?: string;
      userIp: string;
      userAgent: string;
    };
    view: {
      url: string;
      referrerUrl?: string;
      pageType: string;
    };
    cart?: {
      groupId?: string;
      productId?: string;
      sku?: string;
    };
  };
}

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
  req: ProductListingBaseParam,
  method: HttpMethods,
  contentType: HTTPContentType,
  queryStringArguments: Record<string, string> = {}
): Pick<
  PlatformClientCallOptions,
  'accessToken' | 'method' | 'contentType' | 'url' | 'origin'
> => {
  const {platformUrl, organizationId, accessToken, version} = req;
  const baseUrl =
    version === 'v2'
      ? `${platformUrl}/rest/organizations/${organizationId}/properties/a/commerce/v2/listing`
      : `${platformUrl}/rest/organizations/${organizationId}/commerce/v1/products`;
  const queryString = buildQueryString(queryStringArguments);
  const effectiveUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl;

  return {
    accessToken,
    method,
    contentType,
    url: effectiveUrl,
    origin: 'commerceApiFetch',
  };
};

const buildQueryString = (args: Record<string, string>): string => {
  return Object.keys(args)
    .map((argName) => `${argName}=${encodeURIComponent(args[argName])}`)
    .join('&');
};
