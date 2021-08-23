import {ProductRecommendation} from '../../search/search/product-recommendation';
import {
  baseProductListingRequest,
  ProductListingsParam,
} from './product-listings-params';

export type GetProductsRequest = ProductListingsParam;

export const buildGetProductsRequest = (req: GetProductsRequest) => {
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

const prepareRequestParams = (req: GetProductsRequest) => ({
  url: req.url,
});

/**
 * Defines the content of a successful response from the `/commerce/products/listing` API call.
 */
export interface GetProductsResponse {
  items: ProductRecommendation[];
  totalCount: number;
  responseId: string;
}
