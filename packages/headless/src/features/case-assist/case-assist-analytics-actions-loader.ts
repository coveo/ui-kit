import {AsyncThunkAction} from '@reduxjs/toolkit';
import {StateNeededByCaseAssistAnalytics} from '../../api/analytics/analytics';
import {CaseAssistEngine} from '../../app/case-assist-engine/case-assist-engine';
import {AsyncThunkAnalyticsOptions} from '../analytics/analytics-utils';
import {logCaseStart} from './case-assist-analytics-actions';

export interface CaseAssistAnalyticsActionCreators {
  logCaseStart(): AsyncThunkAction<
    {},
    void,
    AsyncThunkAnalyticsOptions<StateNeededByCaseAssistAnalytics>
  >;
}

export function loadCaseAssistAnalyticsActions(
  engine: CaseAssistEngine
): CaseAssistAnalyticsActionCreators {
  engine.addReducers({});

  return {
    logCaseStart,
  };
}
