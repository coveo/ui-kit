import {
  makeAnalyticsAction,
  LegacySearchAction,
} from '../analytics/analytics-utils';
import {SearchPageEvents} from '../analytics/search-action-cause';
import {SearchAction} from '../search/search-actions';

//TODO: KIT-2859
export const logDidYouMeanClick = (): LegacySearchAction =>
  makeAnalyticsAction('analytics/didyoumean/click', (client) =>
    client.makeDidYouMeanClick()
  );

//TODO: KIT-2859
export const logDidYouMeanAutomatic = (): LegacySearchAction =>
  makeAnalyticsAction('analytics/didyoumean/automatic', (client) =>
    client.makeDidYouMeanAutomatic()
  );

export const didYouMeanClick = (): SearchAction => ({
  actionCause: SearchPageEvents.didYouMeanClick,
});

export const didYouMeanAutomatic = (): SearchAction => ({
  actionCause: SearchPageEvents.didYouMeanAutomatic,
});
