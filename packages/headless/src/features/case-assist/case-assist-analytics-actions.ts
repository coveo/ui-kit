import {Result} from '../../api/search/search/result';
import {AnalyticsType, makeAnalyticsAction} from '../analytics/analytics-utils';

export const logCaseStart = (result: Result) =>
  makeAnalyticsAction(
    'analytics/caseAssist/case/start',
    AnalyticsType.CaseAssist,
    (client, state) => {
      return client.logCaseStart();
    }
  )();
