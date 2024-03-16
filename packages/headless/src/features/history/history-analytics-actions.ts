import {SearchPageEvents as LegacySearchPageEvents} from 'coveo.analytics/dist/definitions/searchPage/searchPageEvents';
import {
  makeAnalyticsAction,
  LegacySearchAction,
} from '../analytics/analytics-utils';
import {SearchPageEvents} from '../analytics/search-action-cause';
import {SearchAction} from '../search/search-actions';

// --------------------- KIT-2859 : Everything above this will get deleted ! :) ---------------------
export const historyForward = (): SearchAction => ({
  actionCause: SearchPageEvents.historyForward,
});

export const historyBackward = (): SearchAction => ({
  actionCause: SearchPageEvents.historyBackward,
});

export const noResultsBack = (): SearchAction => ({
  actionCause: SearchPageEvents.noResultsBack,
});
