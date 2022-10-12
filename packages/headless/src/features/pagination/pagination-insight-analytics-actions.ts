import {PaginationSection} from '../../state/state-sections';
import {
  AnalyticsType,
  makeInsightAnalyticsAction,
  InsightAction,
} from '../analytics/analytics-utils';
import {getCaseContextAnalyticsMetadata} from '../case-context/case-context-state';
import {currentPageSelector} from './pagination-selectors';

export const logPageNumber = (): InsightAction =>
  makeInsightAnalyticsAction(
    'analytics/pager/number',
    AnalyticsType.Search,
    (client, state) =>
      client.logPagerNumber({
        pagerNumber: currentPageSelector(state as PaginationSection),
        ...getCaseContextAnalyticsMetadata(state.insightCaseContext),
      })
  );

export const logPageNext = (): InsightAction =>
  makeInsightAnalyticsAction(
    'analytics/pager/next',
    AnalyticsType.Search,
    (client, state) =>
      client.logPagerNext({
        pagerNumber: currentPageSelector(state as PaginationSection),
        ...getCaseContextAnalyticsMetadata(state.insightCaseContext),
      })
  );

export const logPagePrevious = (): InsightAction =>
  makeInsightAnalyticsAction(
    'analytics/pager/previous',
    AnalyticsType.Search,
    (client, state) =>
      client.logPagerPrevious({
        pagerNumber: currentPageSelector(state as PaginationSection),
        ...getCaseContextAnalyticsMetadata(state.insightCaseContext),
      })
  );
