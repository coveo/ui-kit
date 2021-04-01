import pino from 'pino';
import {
  MLAPIClient,
  MLAPIClientOptions,
} from '../api/machine-learning/ml-api-client';

export function buildMockMLAPIClient(options?: Partial<MLAPIClientOptions>) {
  return new MLAPIClient({
    renewAccessToken: async () => '',
    logger: pino({level: 'silent'}),
    ...options,
  });
}
