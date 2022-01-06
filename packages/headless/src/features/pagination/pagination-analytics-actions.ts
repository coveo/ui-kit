import {PaginationSection} from '../../state/state-sections';
import {AnalyticsType, makeAnalyticsAction} from '../analytics/analytics-utils';
import {currentPageSelector} from './pagination-selectors';
import {getPaginationInitialState} from './pagination-state';

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

export const logPageNumber = makeAnalyticsAction(
  'analytics/pager/number',
  AnalyticsType.Search,
  (client, state) =>
    client.logPagerNumber({
      pagerNumber: currentPageSelector(state as PaginationSection),
    })
);

export const logPageNext = makeAnalyticsAction(
  'analytics/pager/next',
  AnalyticsType.Search,
  (client, state) =>
    client.logPagerNext({
      pagerNumber: currentPageSelector(state as PaginationSection),
    })
);

export const logPagePrevious = makeAnalyticsAction(
  'analytics/pager/previous',
  AnalyticsType.Search,
  (client, state) =>
    client.logPagerPrevious({
      pagerNumber: currentPageSelector(state as PaginationSection),
    })
);
