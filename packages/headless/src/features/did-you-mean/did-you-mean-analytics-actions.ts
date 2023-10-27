import {makeAnalyticsAction, SearchAction} from '../analytics/analytics-utils';

export const logDidYouMeanClick = (): SearchAction =>
  makeAnalyticsAction('analytics/didyoumean/click', (client) =>
    client.makeDidYouMeanClick()
  );

export const logDidYouMeanAutomatic = (): SearchAction =>
  makeAnalyticsAction('analytics/didyoumean/automatic', (client) =>
    client.makeDidYouMeanAutomatic()
  );
