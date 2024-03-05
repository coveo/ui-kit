import {EventDescription} from 'coveo.analytics';
import {getVisitorID} from '../../api/analytics/coveo-analytics-utils';
import {
  getAnalyticsSource,
  getPageID,
} from '../../api/analytics/search-analytics';
import {AnalyticsParam} from '../../api/search/search-api-params';
import {AnalyticsState} from './configuration-state';

export const fromAnalyticsStateToAnalyticsParams = async (
  s: AnalyticsState,
  eventDescription?: EventDescription
): Promise<AnalyticsParam> => {
  const isNextAnalytics = s.analyticsMode === 'next';
  return {
    analytics: {
      clientId: await getVisitorID(s),
      clientTimestamp: new Date().toISOString(),
      documentReferrer: s.originLevel3,
      originContext: s.originContext,
      ...(eventDescription && {
        actionCause: eventDescription.actionCause,
        customData: eventDescription.customData,
      }),
      ...(eventDescription &&
        !isNextAnalytics && {
          customData: eventDescription.customData,
        }),
      ...(s.userDisplayName && {userDisplayName: s.userDisplayName}),
      ...(s.documentLocation && {documentLocation: s.documentLocation}),
      ...(s.deviceId && {deviceId: s.deviceId}),
      ...(getPageID() && {pageId: getPageID()}),
      ...(isNextAnalytics && s.trackingId && {trackingId: s.trackingId}),
      ...{capture: isNextAnalytics},
      ...(isNextAnalytics && {source: getAnalyticsSource(s)}),
    },
  };
};
