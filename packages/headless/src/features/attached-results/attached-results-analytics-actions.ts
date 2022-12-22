import {Result} from '../../insight.index';
import {
  AnalyticsType,
  documentIdentifier,
  makeInsightAnalyticsAction,
  partialDocumentInformation,
  validateResultPayload,
} from '../analytics/analytics-utils';
import {getCaseContextAnalyticsMetadata} from '../case-context/case-context-state';

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
