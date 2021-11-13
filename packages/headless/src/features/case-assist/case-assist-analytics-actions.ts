import {AnalyticsType, makeAnalyticsAction} from '../analytics/analytics-utils';

export const logCaseStart = () =>
  makeAnalyticsAction(
    'analytics/caseAssist/case/start',
    AnalyticsType.CaseAssist,
    (client, state) => {
      return client.logCaseStart();
    }
  )();
