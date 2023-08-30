import pino from 'pino';
import {
  CommerceAPIClient,
  CommerceAPIClientOptions,
} from '../api/commerce/commerce-api-client';
import {NoopPreprocessRequest} from '../api/preprocess-request';

export function buildMockProductListingV2APIClient(
  options?: Partial<CommerceAPIClientOptions>
) {
  return new CommerceAPIClient({
    preprocessRequest: NoopPreprocessRequest,
    logger: pino({level: 'silent'}),
    ...options,
  });
}
