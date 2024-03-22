import {PaginationSection} from '../../state/state-sections';
import {
  makeInsightAnalyticsActionFactory,
  InsightAction,
} from '../analytics/analytics-utils';
import {SearchPageEvents} from '../analytics/search-action-cause';
import {getCaseContextAnalyticsMetadata} from '../case-context/case-context-state';
import {currentPageSelector} from './pagination-selectors';

export const logPageNumber = (): InsightAction =>
  makeInsightAnalyticsActionFactory(SearchPageEvents.pagerNumber)(
    'analytics/pager/number',
    (client, state) =>
      client.logPagerNumber({
        pagerNumber: currentPageSelector(state as PaginationSection),
        ...getCaseContextAnalyticsMetadata(state.insightCaseContext),
      })
  );

export const logPageNext = (): InsightAction =>
  makeInsightAnalyticsActionFactory(SearchPageEvents.pagerNext)(
    'analytics/pager/next',
    (client, state) =>
      client.logPagerNext({
        pagerNumber: currentPageSelector(state as PaginationSection),
        ...getCaseContextAnalyticsMetadata(state.insightCaseContext),
      })
  );

export const logPagePrevious = (): InsightAction =>
  makeInsightAnalyticsActionFactory(SearchPageEvents.pagerPrevious)(
    'analytics/pager/previous',
    (client, state) =>
      client.logPagerPrevious({
        pagerNumber: currentPageSelector(state as PaginationSection),
        ...getCaseContextAnalyticsMetadata(state.insightCaseContext),
      })
  );
