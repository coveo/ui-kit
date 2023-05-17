import {
  CoveoAnalyticsClient,
  IRuntimeEnvironment,
  history,
} from 'coveo.analytics';

export const getVisitorID = (options: {
  runtimeEnvironment?: IRuntimeEnvironment;
}) => new CoveoAnalyticsClient(options).getCurrentVisitorId();

export const clearAnalyticsClient = (options: {
  runtimeEnvironment?: IRuntimeEnvironment;
}) => {
  const client = new CoveoAnalyticsClient(options);
  client.clear();
  client.deleteHttpOnlyVisitorId();
};

export const historyStore = new history.HistoryStore();
