import type {PaginationSection} from '../../state/state-sections.js';
import {
  type LegacySearchAction,
  makeAnalyticsAction,
} from '../analytics/analytics-utils.js';
import {SearchPageEvents} from '../analytics/search-action-cause.js';
import type {SearchAction} from '../search/search-actions.js';
import {currentPageSelector} from './pagination-selectors.js';
import {getPaginationInitialState} from './pagination-state.js';

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
