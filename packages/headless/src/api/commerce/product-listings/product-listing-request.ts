import {ProductRecommendation} from '../../search/search/product-recommendation';
import {
  baseProductListingRequest,
  ProductListingsParam,
} from './product-listing-params';

export type ProductListingRequest = ProductListingsParam;

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

const prepareRequestParams = (req: ProductListingRequest) => {
  const {accessToken, platformUrl, organizationId, version, ...params} = req;
  return params;
};

/**
 * Defines the content of a successful response from the `/commerce/products/listing` API call.
 */
export interface ProductListingSuccessResponse {
  products: ProductRecommendation[];
  pagination: {
    totalCount: number;
  };
  responseId: string;
}
