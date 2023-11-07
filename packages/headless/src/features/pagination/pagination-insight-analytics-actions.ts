import {PaginationSection} from '../../state/state-sections';
import {
  makeInsightAnalyticsAction,
  InsightAction,
} from '../analytics/analytics-utils';
import {getCaseContextAnalyticsMetadata} from '../case-context/case-context-state';
import {currentPageSelector} from './pagination-selectors';

export const logPageNumber = (): InsightAction =>
  makeInsightAnalyticsAction('analytics/pager/number', (client, state) =>
    client.logPagerNumber({
      pagerNumber: currentPageSelector(state as PaginationSection),
      ...getCaseContextAnalyticsMetadata(state.insightCaseContext),
    })
  );

export const logPageNext = (): InsightAction =>
  makeInsightAnalyticsAction('analytics/pager/next', (client, state) =>
    client.logPagerNext({
      pagerNumber: currentPageSelector(state as PaginationSection),
      ...getCaseContextAnalyticsMetadata(state.insightCaseContext),
    })
  );

export const logPagePrevious = (): InsightAction =>
  makeInsightAnalyticsAction('analytics/pager/previous', (client, state) =>
    client.logPagerPrevious({
      pagerNumber: currentPageSelector(state as PaginationSection),
      ...getCaseContextAnalyticsMetadata(state.insightCaseContext),
    })
  );
