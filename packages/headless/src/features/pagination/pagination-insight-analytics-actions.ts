import {PaginationSection} from '../../state/state-sections';
import {
  makeInsightAnalyticsActionFactory,
  InsightAction,
} from '../analytics/analytics-utils';
import {LegacySearchPageEvents} from '../analytics/legacy-search-action-cause';
import {getCaseContextAnalyticsMetadata} from '../case-context/case-context-state';
import {currentPageSelector} from './pagination-selectors';

export const logPageNumber = (): InsightAction =>
  makeInsightAnalyticsActionFactory(LegacySearchPageEvents.pagerNumber)(
    'analytics/pager/number',
    (client, state) =>
      client.logPagerNumber({
        pagerNumber: currentPageSelector(state as PaginationSection),
        ...getCaseContextAnalyticsMetadata(state.insightCaseContext),
      })
  );

export const logPageNext = (): InsightAction =>
  makeInsightAnalyticsActionFactory(LegacySearchPageEvents.pagerNext)(
    'analytics/pager/next',
    (client, state) =>
      client.logPagerNext({
        pagerNumber: currentPageSelector(state as PaginationSection),
        ...getCaseContextAnalyticsMetadata(state.insightCaseContext),
      })
  );

export const logPagePrevious = (): InsightAction =>
  makeInsightAnalyticsActionFactory(LegacySearchPageEvents.pagerPrevious)(
    'analytics/pager/previous',
    (client, state) =>
      client.logPagerPrevious({
        pagerNumber: currentPageSelector(state as PaginationSection),
        ...getCaseContextAnalyticsMetadata(state.insightCaseContext),
      })
  );
