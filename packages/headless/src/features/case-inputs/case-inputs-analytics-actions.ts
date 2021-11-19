import {AnalyticsType, makeAnalyticsAction} from '../analytics/analytics-utils';

export const logCaseFieldUpdate = () =>
  makeAnalyticsAction(
    'analytics/caseAssist/case/field/update',
    AnalyticsType.CaseAssist,
    (client, state) => {
      return client.logCaseFieldUpdate();
    }
  )();
