import {pino} from 'pino';
import {NoopPreprocessRequest} from '../api/preprocess-request.js';
import {
  InsightAPIClient,
  InsightAPIClientOptions,
} from '../api/service/insight/insight-api-client.js';

export function buildMockInsightAPIClient(
  options?: Partial<InsightAPIClientOptions>
) {
  return new InsightAPIClient({
    logger: pino({level: 'silent'}),
    preprocessRequest: NoopPreprocessRequest,
    ...options,
  });
}
