import pino from 'pino';
import {
  ServiceAPIClient,
  ServiceAPIClientOptions,
} from '../api/service/service-api-client';

export function buildMockServiceAPIClient(
  options?: Partial<ServiceAPIClientOptions>
) {
  return new ServiceAPIClient({
    renewAccessToken: async () => '',
    logger: pino({level: 'silent'}),
    ...options,
  });
}
