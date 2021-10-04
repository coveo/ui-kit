import pino from 'pino';
import {
  ProductListingAPIClient,
  ProductListingAPIClientOptions,
} from '../api/commerce/product-listings/product-listing-api-client';
import {NoopPreprocessRequest} from '../api/preprocess-request';

export function buildMockProductListingAPIClient(
  options?: Partial<ProductListingAPIClientOptions>
) {
  return new ProductListingAPIClient({
    preprocessRequest: NoopPreprocessRequest,
    logger: pino({level: 'silent'}),
    ...options,
  });
}
