import {SearchAnalyticsProvider} from '../../api/analytics/search-analytics';
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

export const logDidYouMeanAutomatic = (): LegacySearchAction =>
  makeAnalyticsAction('analytics/didyoumean/automatic', (client) =>
    client.makeDidYouMeanAutomatic()
  );

export const didYouMeanClick = (): SearchAction => {
  return {
    actionCause: SearchPageEvents.didyoumeanClick,
    getEventExtraPayload: (state) =>
      new SearchAnalyticsProvider(() => state).getBaseMetadata(),
  };
};
