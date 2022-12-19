import {PaginationSection} from '../../state/state-sections';
import {
  AnalyticsType,
  makeAnalyticsAction,
  SearchAction,
} from '../analytics/analytics-utils';
import {currentPageSelector} from './pagination-selectors';
import {getPaginationInitialState} from './pagination-state';

export const logPagerResize = (): SearchAction =>
  makeAnalyticsAction(
    'analytics/pager/resize',
    AnalyticsType.Search,
    (client, state) =>
      client.makePagerResize({
        currentResultsPerPage:
          state.pagination?.numberOfResults ||
          getPaginationInitialState().numberOfResults,
      })
  );

export const logPageNumber = (): SearchAction =>
  makeAnalyticsAction(
    'analytics/pager/number',
    AnalyticsType.Search,
    (client, state) =>
      client.makePagerNumber({
        pagerNumber: currentPageSelector(state as PaginationSection),
      })
  );

export const logPageNext = (): SearchAction =>
  makeAnalyticsAction(
    'analytics/pager/next',
    AnalyticsType.Search,
    (client, state) =>
      client.makePagerNext({
        pagerNumber: currentPageSelector(state as PaginationSection),
      })
  );

export const logPagePrevious = (): SearchAction =>
  makeAnalyticsAction(
    'analytics/pager/previous',
    AnalyticsType.Search,
    (client, state) =>
      client.makePagerPrevious({
        pagerNumber: currentPageSelector(state as PaginationSection),
      })
  );
