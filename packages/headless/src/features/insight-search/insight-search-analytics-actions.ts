import {SearchAPIErrorWithStatusCode} from '../../api/search/search-api-error-response';
import {
  InsightAction,
  makeInsightAnalyticsAction,
} from '../analytics/analytics-utils';
import {getCaseContextAnalyticsMetadata} from '../case-context/case-context-state';
import {getQueryInitialState} from '../query/query-state';

export const logFetchMoreResults = (): InsightAction =>
  makeInsightAnalyticsAction('search/logFetchMoreResults', (client, state) =>
    client.logFetchMoreResults(
      getCaseContextAnalyticsMetadata(state.insightCaseContext)
    )
  );

export const logQueryError = (
  error: SearchAPIErrorWithStatusCode
): InsightAction =>
  makeInsightAnalyticsAction('search/queryError', (client, state) =>
    client.logQueryError({
      ...getCaseContextAnalyticsMetadata(state.insightCaseContext),
      query: state.query?.q || getQueryInitialState().q,
      aq: '',
      cq: '',
      dq: '',
      errorType: error.type,
      errorMessage: error.message,
    })
  );

export const logContextChanged = (
  caseId: string,
  caseNumber: string
): InsightAction =>
  makeInsightAnalyticsAction('analytics/contextChanged', (client, state) => {
    const meta = {
      caseId,
      caseNumber,
      caseContext: state.insightCaseContext?.caseContext || {},
    };
    client.logContextChanged(meta);
  });

export const logInsightInterfaceLoad = (): InsightAction =>
  makeInsightAnalyticsAction('analytics/interface/load', (client, state) =>
    client.logInterfaceLoad(
      getCaseContextAnalyticsMetadata(state.insightCaseContext)
    )
  );

export const logInsightInterfaceChange = (): InsightAction =>
  makeInsightAnalyticsAction('analytics/interface/change', (client, state) => {
    client.logInterfaceChange({
      ...getCaseContextAnalyticsMetadata(state.insightCaseContext),
      interfaceChangeTo: state.configuration.analytics.originLevel2,
    });
  });
