import {InsightPanel} from '@coveo/relay-event-types';
import type {CoveoInsightClient} from 'coveo.analytics';
import {
  configureInsightAnalytics,
  InsightAnalyticsProvider,
  StateNeededByInsightAnalyticsProvider,
} from '../../api/analytics/insight-analytics.js';
import {ThunkExtraArguments} from '../../app/thunk-extra-arguments.js';
import {InsightAppState} from '../../state/insight-app-state.js';
import {getCaseContextAnalyticsMetadata} from '../case-context/case-context-state.js';
import {
  fromLogToLegacyBuilderFactory,
  LogFunction,
  makeAnalyticsActionFactory,
  PreparableAnalyticsAction,
} from './analytics-utils.js';

export interface AsyncThunkInsightAnalyticsOptions<
  T extends Partial<StateNeededByInsightAnalyticsProvider>,
> {
  state: T;
  extra: ThunkExtraArguments;
}

export type InsightAction =
  PreparableAnalyticsAction<StateNeededByInsightAnalyticsProvider>;

// TODO SFINT-5420: Update from where we are grabbing the case context.
export const analyticsEventCaseContext = (
  state: Partial<InsightAppState>
): InsightPanel.Context => {
  const metadata = getCaseContextAnalyticsMetadata(state.insightCaseContext);
  return {
    targetId: metadata.caseId || '',
    targetType: 'Case',
    caseNumber: metadata.caseNumber,
  } as InsightPanel.Context;
};

export const makeInsightAnalyticsActionFactory = (actionCause: string) => {
  const makeInsightAnalyticsAction = makeAnalyticsActionFactory<
    StateNeededByInsightAnalyticsProvider,
    StateNeededByInsightAnalyticsProvider,
    CoveoInsightClient,
    InsightAnalyticsProvider,
    LogFunction<CoveoInsightClient, StateNeededByInsightAnalyticsProvider>
  >(
    configureInsightAnalytics,
    fromLogToLegacyBuilderFactory(actionCause),
    InsightAnalyticsProvider
  );
  return makeInsightAnalyticsAction;
};
