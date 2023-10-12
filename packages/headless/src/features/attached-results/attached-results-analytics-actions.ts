import {Result} from '../../insight.index.js';
import {
  AnalyticsType,
  documentIdentifier,
  makeInsightAnalyticsAction,
  partialDocumentInformation,
  validateResultPayload,
} from '../analytics/analytics-utils.js';
import {getCaseContextAnalyticsMetadata} from '../case-context/case-context-state.js';

export const logCaseAttach = (result: Result) =>
  makeInsightAnalyticsAction(
    'insight/caseAttach',
    AnalyticsType.Click,
    (client, state) => {
      validateResultPayload(result);
      const metadata = getCaseContextAnalyticsMetadata(
        state.insightCaseContext
      );
      return client.logCaseAttach(
        partialDocumentInformation(result, state),
        documentIdentifier(result),
        metadata
      );
    }
  )();

export const logCaseDetach = (resultUriHash: string) =>
  makeInsightAnalyticsAction(
    'insight/caseDetach',
    AnalyticsType.Custom,
    (client, state) =>
      client.logCaseDetach(
        resultUriHash,
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      )
  )();
