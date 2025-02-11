import {CoveoAnalyticsClient, IRuntimeEnvironment} from 'coveo.analytics';

export const getVisitorID = (options: {
  runtimeEnvironment?: IRuntimeEnvironment;
}) => new CoveoAnalyticsClient(options).getCurrentVisitorId();
