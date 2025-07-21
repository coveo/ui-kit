import {pino} from 'pino';
import {NoopPreprocessRequest} from '../api/preprocess-request.js';
import {
  CaseAssistAPIClient,
  type CaseAssistAPIClientOptions,
} from '../api/service/case-assist/case-assist-api-client.js';

export function buildMockCaseAssistAPIClient(
  options?: Partial<CaseAssistAPIClientOptions>
) {
  return new CaseAssistAPIClient({
    preprocessRequest: NoopPreprocessRequest,
    logger: pino({level: 'silent'}),
    ...options,
  });
}
