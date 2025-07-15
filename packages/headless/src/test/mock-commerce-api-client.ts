import {pino} from 'pino';
import {
  CommerceAPIClient,
  type CommerceAPIClientOptions,
} from '../api/commerce/commerce-api-client.js';
import {NoopPreprocessRequest} from '../api/preprocess-request.js';

export function buildMockCommerceAPIClient(
  options?: Partial<CommerceAPIClientOptions>
) {
  return new CommerceAPIClient({
    preprocessRequest: NoopPreprocessRequest,
    logger: pino({level: 'silent'}),
    ...options,
  });
}
