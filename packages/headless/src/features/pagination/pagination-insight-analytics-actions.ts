import {PaginationSection} from '../../state/state-sections';
import {
  AnalyticsType,
  makeInsightAnalyticsAction,
} from '../analytics/analytics-utils';
import {currentPageSelector} from './pagination-selectors';

export const logPageNumber = makeInsightAnalyticsAction(
  'analytics/pager/number',
  AnalyticsType.Search,
  (client, state) =>
    client.logPagerNumber({
      pagerNumber: currentPageSelector(state as PaginationSection),
      caseContext: state.insightCaseContext?.caseContext || {},
      caseId: state.insightCaseContext?.caseId,
      caseNumber: state.insightCaseContext?.caseNumber,
    })
);

export const logPageNext = makeInsightAnalyticsAction(
  'analytics/pager/next',
  AnalyticsType.Search,
  (client, state) =>
    client.logPagerNext({
      pagerNumber: currentPageSelector(state as PaginationSection),
      caseContext: state.insightCaseContext?.caseContext || {},
      caseId: state.insightCaseContext?.caseId,
      caseNumber: state.insightCaseContext?.caseNumber,
    })
);

export const logPagePrevious = makeInsightAnalyticsAction(
  'analytics/pager/previous',
  AnalyticsType.Search,
  (client, state) =>
    client.logPagerPrevious({
      pagerNumber: currentPageSelector(state as PaginationSection),
      caseContext: state.insightCaseContext?.caseContext || {},
      caseId: state.insightCaseContext?.caseId,
      caseNumber: state.insightCaseContext?.caseNumber,
    })
);
