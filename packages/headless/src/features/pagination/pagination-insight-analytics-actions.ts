import type {PaginationSection} from '../../state/state-sections.js';
import {
  type InsightAction,
  makeInsightAnalyticsActionFactory,
} from '../analytics/analytics-utils.js';
import {LegacySearchPageEvents} from '../analytics/legacy-search-action-cause.js';
import {getCaseContextAnalyticsMetadata} from '../case-context/case-context-state.js';
import {currentPageSelector} from './pagination-selectors.js';

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
