import {ContextPayload} from '../../../controllers/product-listing/context/headless-product-listing-context';
import {Mode} from '../../../controllers/product-listing/headless-product-listing';
import {FacetOptions} from '../../../features/facet-options/facet-options';
import {FacetValueRequest} from '../../../features/facets/facet-set/interfaces/request';
import {AnyFacetRequest} from '../../../features/facets/generic/interfaces/generic-facet-request';
import {RangeValueRequest} from '../../../features/facets/range-facets/generic/interfaces/range-facet';
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

/*
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
 */

export interface SelectedFacets
  extends Pick<AnyFacetRequest, 'field' | 'type' | 'facetId'> {
  values?: (FacetValueRequest | RangeValueRequest)[];
}

export interface Context {
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
  }[];
}

// TODO: Use interfaces for nested params
export interface ProductListingV2RequestParam {
  propertyId: string;
  listingId: string;
  locale: string;
  mode: Mode;
  clientId: string;
  selectedFacets?: SelectedFacets[];
  selectedPage?: {
    page?: number;
  };
  selectedSort?: SortCriterion;
  context: Context;
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
  let baseUrl;
  if (version === 'v2') {
    const {propertyId} = req as ProductListingsV2Param;
    baseUrl = `${platformUrl}/rest/organizations/${organizationId}/properties/${propertyId}/commerce/v2/listing`;
  } else {
    baseUrl = `${platformUrl}/rest/organizations/${organizationId}/commerce/v1/products`;
  }
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
