import {
  makeAnalyticsAction,
  LegacySearchAction,
} from '../analytics/analytics-utils';
import {SearchPageEvents} from '../analytics/search-action-cause';
import {SearchAction} from '../search/search-actions';

export const didYouMeanClick = (): SearchAction => ({
  actionCause: SearchPageEvents.didyoumeanClick,
});

export const didYouMeanAutomatic = (): SearchAction => ({
  actionCause: SearchPageEvents.didyoumeanAutomatic,
});
