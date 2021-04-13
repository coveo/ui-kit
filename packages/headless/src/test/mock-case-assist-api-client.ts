import pino from 'pino';
import {
  CaseAssistAPIClient,
  CaseAssistAPIClientOptions,
} from '../api/service/case-assist/case-assist-api-client';

export function buildMockCaseAssistAPIClient(
  options?: Partial<CaseAssistAPIClientOptions>
) {
  return new CaseAssistAPIClient({
    renewAccessToken: async () => '',
    logger: pino({level: 'silent'}),
    ...options,
  });
}
