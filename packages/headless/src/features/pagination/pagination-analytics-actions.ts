import {PaginationSection} from '../../state/state-sections';
import {makeAnalyticsAction, SearchAction} from '../analytics/analytics-utils';
import {currentPageSelector} from './pagination-selectors';
import {getPaginationInitialState} from './pagination-state';

export const logPagerResize = (): SearchAction =>
  makeAnalyticsAction('analytics/pager/resize', (client, state) =>
    client.makePagerResize({
      currentResultsPerPage:
        state.pagination?.numberOfResults ||
        getPaginationInitialState().numberOfResults,
    })
  );

export const logPageNumber = (): SearchAction =>
  makeAnalyticsAction('analytics/pager/number', (client, state) =>
    client.makePagerNumber({
      pagerNumber: currentPageSelector(state as PaginationSection),
    })
  );

export const logPageNext = (): SearchAction =>
  makeAnalyticsAction('analytics/pager/next', (client, state) =>
    client.makePagerNext({
      pagerNumber: currentPageSelector(state as PaginationSection),
    })
  );

export const logPagePrevious = (): SearchAction =>
  makeAnalyticsAction('analytics/pager/previous', (client, state) =>
    client.makePagerPrevious({
      pagerNumber: currentPageSelector(state as PaginationSection),
    })
  );
