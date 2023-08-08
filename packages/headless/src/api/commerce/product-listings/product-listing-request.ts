import {AnyFacetResponse} from '../../../features/facets/generic/interfaces/generic-facet-response';
import {ProductRecommendation} from '../../search/search/product-recommendation';
import {
  baseProductListingRequest,
  ProductListingsParam,
  ProductListingsV2Param,
} from './product-listing-params';

export type ProductListingRequest = ProductListingsParam;
export type ProductListingV2Request = ProductListingsV2Param;

export const buildProductListingRequest = (req: ProductListingRequest) => {
  const queryStringArguments: Record<string, string> = {};

  return {
    ...baseProductListingRequest(
      req,
      'POST',
      'application/json',
      queryStringArguments
    ),
    requestParams: prepareRequestParams(req),
  };
};

export const buildProductListingV2Request = (req: ProductListingV2Request) => {
  const queryStringArguments: Record<string, string> = {};

  return {
    ...baseProductListingRequest(
      req,
      'POST',
      'application/json',
      queryStringArguments
    ),
    requestParams: prepareRequestParams(req),
  };
};

const prepareRequestParams = (
  req: ProductListingRequest | ProductListingV2Request
) => {
  const {accessToken, platformUrl, organizationId, version, ...params} = req;
  return params;
};

/**
 * Defines the content of a successful response from the `/commerce/products/listing` API call.
 */
export interface ProductListingSuccessResponse {
  facets: {
    results: AnyFacetResponse[];
  };
  products: ProductRecommendation[];
  pagination: {
    totalCount: number;
  };
  responseId: string;
}

export interface ProductListingV2SuccessResponse {
  listingId: string;
  locale: string;
  responseId: string;
  products: ProductRecommendation[];
  facets: AnyFacetResponse[];
  pagination: {
    page: number;
    perPage: number;
    totalCount: number;
    totalPages: number;
  };
  sort: {
    appliedSort: {
      type: string;
      field: string;
      direction: string;
      displayName: string;
    };
    availableSorts: {
      type: string;
      field: string;
      direction: string;
      displayName: string;
    }[];
  };
}
