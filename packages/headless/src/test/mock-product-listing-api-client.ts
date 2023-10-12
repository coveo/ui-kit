import {pino} from 'pino';
import {
  ProductListingAPIClient,
  ProductListingAPIClientOptions,
} from '../api/commerce/product-listings/product-listing-api-client.js';
import {NoopPreprocessRequest} from '../api/preprocess-request.js';
import {buildMockSearchAPIClient} from './mock-search-api-client.js';

export function buildMockProductListingAPIClient(
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
