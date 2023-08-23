import pino from 'pino';
import {
  ProductListingV2APIClient,
  ProductListingV2APIClientOptions,
} from '../api/commerce/product-listings/v2/product-listing-v2-api-client';
import {NoopPreprocessRequest} from '../api/preprocess-request';
import {buildMockSearchAPIClient} from './mock-search-api-client';

export function buildMockProductListingV2APIClient(
  options?: Partial<ProductListingV2APIClientOptions>
) {
  return new ProductListingV2APIClient(
    {
      preprocessRequest: NoopPreprocessRequest,
      logger: pino({level: 'silent'}),
      ...options,
    },
    buildMockSearchAPIClient()
  );
}
