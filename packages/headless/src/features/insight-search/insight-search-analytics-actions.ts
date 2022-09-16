import {SearchAPIErrorWithStatusCode} from '../../api/search/search-api-error-response';
import {
  AnalyticsType,
  makeInsightAnalyticsAction,
} from '../analytics/analytics-utils';
import {getQueryInitialState} from '../query/query-state';

export const logFetchMoreResults = makeInsightAnalyticsAction(
  'search/logFetchMoreResults',
  AnalyticsType.Search,
  (client, state) =>
    client.logFetchMoreResults({
      caseContext: state.insightCaseContext?.caseContext || {},
      caseId: state.insightCaseContext?.caseId,
      caseNumber: state.insightCaseContext?.caseNumber,
    })
);

export const logQueryError = (error: SearchAPIErrorWithStatusCode) =>
  makeInsightAnalyticsAction(
    'search/queryError',
    AnalyticsType.Search,
    (client, state) =>
      client.logQueryError({
        caseContext: state.insightCaseContext?.caseContext || {},
        caseId: state.insightCaseContext?.caseId,
        caseNumber: state.insightCaseContext?.caseNumber,
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
