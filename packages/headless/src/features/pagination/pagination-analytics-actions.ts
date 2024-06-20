import {PaginationSection} from '../../state/state-sections';
import {
  makeAnalyticsAction,
  LegacySearchAction,
} from '../analytics/analytics-utils';
import {SearchPageEvents} from '../analytics/search-action-cause';
import {SearchAction} from '../search/search-actions';
import {currentPageSelector} from './pagination-selectors';
import {getPaginationInitialState} from './pagination-state';

export const logPagerResize = (): LegacySearchAction =>
  makeAnalyticsAction('analytics/pager/resize', (client, state) =>
    client.makePagerResize({
      currentResultsPerPage:
        state.pagination?.numberOfResults ||
        getPaginationInitialState().numberOfResults,
    })
  );

export const logPageNumber = (): LegacySearchAction =>
  makeAnalyticsAction('analytics/pager/number', (client, state) =>
    client.makePagerNumber({
      pagerNumber: currentPageSelector(state as PaginationSection),
    })
  );

export const logPageNext = (): LegacySearchAction =>
  makeAnalyticsAction('analytics/pager/next', (client, state) =>
    client.makePagerNext({
      pagerNumber: currentPageSelector(state as PaginationSection),
    })
  );

export const logPagePrevious = (): LegacySearchAction =>
  makeAnalyticsAction('analytics/pager/previous', (client, state) =>
    client.makePagerPrevious({
      pagerNumber: currentPageSelector(state as PaginationSection),
    })
  );

// TODO KIT-2983
export const browseResults = (): SearchAction => ({
  actionCause: SearchPageEvents.browseResults,
});
