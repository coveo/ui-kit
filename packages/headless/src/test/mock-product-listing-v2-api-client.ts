import pino from 'pino';
import {
  ProductListingAPIClient,
  ProductListingAPIClientOptions,
} from '../api/commerce/product-listings/v2/product-listing-v2-api-client';
import {NoopPreprocessRequest} from '../api/preprocess-request';
import {buildMockSearchAPIClient} from './mock-search-api-client';

export function buildMockProductListingV2APIClient(
  options?: Partial<ProductListingAPIClientOptions>
) {
  return new ProductListingAPIClient(
    {
      preprocessRequest: NoopPreprocessRequest,
      logger: pino({level: 'silent'}),
      ...options,
    },
    buildMockSearchAPIClient()
  );
}
