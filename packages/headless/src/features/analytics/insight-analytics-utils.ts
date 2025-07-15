import type {InsightPanel} from '@coveo/relay-event-types';
import type {InsightAppState} from '../../state/insight-app-state.js';
import {getCaseContextAnalyticsMetadata} from '../case-context/case-context-state.js';

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
