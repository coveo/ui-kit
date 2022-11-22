import {SearchAPIErrorWithStatusCode} from '../../api/search/search-api-error-response';
import {Result} from '../../insight.index';
import {
  AnalyticsType,
  documentIdentifier,
  makeInsightAnalyticsAction,
  partialDocumentInformation,
  validateResultPayload,
} from '../analytics/analytics-utils';
import {getCaseContextAnalyticsMetadata} from '../case-context/case-context-state';
import {getQueryInitialState} from '../query/query-state';

export const logFetchMoreResults = makeInsightAnalyticsAction(
  'search/logFetchMoreResults',
  AnalyticsType.Search,
  (client, state) =>
    client.logFetchMoreResults(
      getCaseContextAnalyticsMetadata(state.insightCaseContext)
    )
);

export const logQueryError = (error: SearchAPIErrorWithStatusCode) =>
  makeInsightAnalyticsAction(
    'search/queryError',
    AnalyticsType.Search,
    (client, state) =>
      client.logQueryError({
        ...getCaseContextAnalyticsMetadata(state.insightCaseContext),
        query: state.query?.q || getQueryInitialState().q,
        aq: '',
        cq: '',
        dq: '',
        errorType: error.type,
        errorMessage: error.message,
      })
  )();

export const logContextChanged = (caseId: string, caseNumber: string) =>
  makeInsightAnalyticsAction(
    'analytics/contextChanged',
    AnalyticsType.Search,
    (client, state) => {
      const meta = {
        caseId,
        caseNumber,
        caseContext: state.insightCaseContext?.caseContext || {},
      };
      client.logContextChanged(meta);
    }
  )();

export const logExpandToFullUI = (
  caseId: string,
  caseNumber: string,
  fullSearchComponentName: string,
  triggeredBy: string
) =>
  makeInsightAnalyticsAction(
    'analytics/expandToFullUI',
    AnalyticsType.Custom,
    (client, state) => {
      const meta = {
        caseId,
        caseNumber,
        fullSearchComponentName,
        triggeredBy,
        caseContext: state.insightCaseContext?.caseContext || {},
      };
      client.logExpandToFullUI(meta);
    }
  )();

export const logCopyToClipboard = (result: Result) =>
  makeInsightAnalyticsAction(
    'analytics/insight/copyToClipboard',
    AnalyticsType.Click,
    (client, state) => {
      validateResultPayload(result);
      const metadata = getCaseContextAnalyticsMetadata(
        state.insightCaseContext
      );
      return client.logCopyToClipboard(
        partialDocumentInformation(result, state),
        documentIdentifier(result),
        metadata
      );
    }
  )();
