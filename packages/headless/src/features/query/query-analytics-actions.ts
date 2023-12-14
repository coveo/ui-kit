import {SearchAnalyticsProvider} from '../../api/analytics/search-analytics';
import {
  makeAnalyticsAction,
  LegacySearchAction,
} from '../analytics/analytics-utils';
import {SearchPageEvents} from '../analytics/search-action-cause';
import {SearchAction} from '../search/search-actions';

//TODO: KIT-2859
export const logSearchboxSubmit = (): LegacySearchAction =>
  makeAnalyticsAction('analytics/searchbox/submit', (client) =>
    client.makeSearchboxSubmit()
  );

export const searchboxSubmit = (): SearchAction => {
  return {
    actionCause: SearchPageEvents.searchboxSubmit,
    getEventExtraPayload: (state) =>
      new SearchAnalyticsProvider(() => state).getBaseMetadata(),
  };
};
