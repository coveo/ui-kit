import {InsightPanel} from '@coveo/relay-event-types';
import {InsightAppState} from '../../state/insight-app-state';
import {getCaseContextAnalyticsMetadata} from '../case-context/case-context-state';

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
