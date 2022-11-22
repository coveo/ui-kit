import {getPageID, getVisitorID} from '../../api/analytics/search-analytics';
import {AnalyticsParam} from '../../api/search/search-api-params';
import {AnalyticsState} from './configuration-state';

export const fromAnalyticsStateToAnalyticsParams = async (
  s: AnalyticsState
): Promise<AnalyticsParam> => {
  return {
    analytics: {
      clientId: await getVisitorID(s),
      clientTimestamp: new Date().toISOString(),
      documentReferrer: s.originLevel3,
      originContext: s.originContext,
      ...(s.userDisplayName && {userDisplayName: s.userDisplayName}),
      ...(s.documentLocation && {documentLocation: s.documentLocation}),
      ...(s.deviceId && {deviceId: s.deviceId}),
      ...(getPageID() && {pageId: getPageID()}),
    },
  };
};
