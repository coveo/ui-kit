import type {CaseAssistClient} from 'coveo.analytics';
import {
  StateNeededByCaseAssistAnalytics,
  CaseAssistAnalyticsProvider,
  configureCaseAssistAnalytics,
} from '../../api/analytics/case-assist-analytics.js';
import {
  makeAnalyticsActionFactory,
  LogFunction,
  fromLogToLegacyBuilderFactory,
  PreparableAnalyticsAction,
} from './analytics-utils.js';

export type CaseAssistAction =
  PreparableAnalyticsAction<StateNeededByCaseAssistAnalytics>;

export const makeCaseAssistAnalyticsAction = makeAnalyticsActionFactory<
  StateNeededByCaseAssistAnalytics,
  StateNeededByCaseAssistAnalytics,
  CaseAssistClient,
  CaseAssistAnalyticsProvider,
  LogFunction<CaseAssistClient, StateNeededByCaseAssistAnalytics>
>(
  configureCaseAssistAnalytics,
  fromLogToLegacyBuilderFactory('caseAssist'),
  CaseAssistAnalyticsProvider
);
