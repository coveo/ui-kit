import {
  makeAnalyticsAction,
  LegacySearchAction,
} from '../analytics/analytics-utils';

//TODO: KIT-2859
export const logDidYouMeanClick = (): LegacySearchAction =>
  makeAnalyticsAction('analytics/didyoumean/click', (client) =>
    client.makeDidYouMeanClick()
  );

export const logDidYouMeanAutomatic = (): LegacySearchAction =>
  makeAnalyticsAction('analytics/didyoumean/automatic', (client) =>
    client.makeDidYouMeanAutomatic()
  );
