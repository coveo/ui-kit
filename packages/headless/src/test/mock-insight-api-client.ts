import pino from 'pino';
import {NoopPreprocessRequest} from '../api/preprocess-request';
import {
  InsightAPIClient,
  InsightAPIClientOptions,
} from '../api/service/insight/insight-api-client';

export function buildMockInsightAPIClient(
  options?: Partial<InsightAPIClientOptions>
) {
  return new InsightAPIClient({
    logger: pino({level: 'silent'}),
    preprocessRequest: NoopPreprocessRequest,
    ...options,
  });
}
