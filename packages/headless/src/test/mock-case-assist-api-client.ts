import pino from 'pino';
import {NoopPreprocessRequest} from '../api/preprocess-request';
import {
  CaseAssistAPIClient,
  CaseAssistAPIClientOptions,
} from '../api/service/case-assist/case-assist-api-client';

export function buildMockCaseAssistAPIClient(
  options?: Partial<CaseAssistAPIClientOptions>
) {
  return new CaseAssistAPIClient({
    preprocessRequest: NoopPreprocessRequest,
    renewAccessToken: async () => '',
    logger: pino({level: 'silent'}),
    ...options,
  });
}
