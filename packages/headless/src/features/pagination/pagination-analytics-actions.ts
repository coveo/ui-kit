import {PaginationSection} from '../../state/state-sections';
import {
  makeAnalyticsAction,
  AnalyticsType,
} from '../analytics/analytics-actions';
import {currentPageSelector} from './pagination-selectors';
import {getPaginationInitialState} from './pagination-state';

/**
 * Log pager resize
 */
export const logPagerResize = makeAnalyticsAction(
  'analytics/pager/resize',
  AnalyticsType.Search,
  (client, state) =>
    client.logPagerResize({
      currentResultsPerPage:
        state.pagination?.numberOfResults ||
        getPaginationInitialState().numberOfResults,
    })
);

/**
 * Log page number
 */
export const logPageNumber = makeAnalyticsAction(
  'analytics/pager/number',
  AnalyticsType.Search,
  (client, state) =>
    client.logPagerNumber({
      pagerNumber: currentPageSelector(state as PaginationSection),
    })
);

/**
 * Log pager next
 */
export const logPageNext = makeAnalyticsAction(
  'analytics/pager/next',
  AnalyticsType.Search,
  (client, state) =>
    client.logPagerNext({
      pagerNumber: currentPageSelector(state as PaginationSection),
    })
);

/**
 * Log pager previous
 */
export const logPagePrevious = makeAnalyticsAction(
  'analytics/pager/previous',
  AnalyticsType.Search,
  (client, state) =>
    client.logPagerPrevious({
      pagerNumber: currentPageSelector(state as PaginationSection),
    })
);
