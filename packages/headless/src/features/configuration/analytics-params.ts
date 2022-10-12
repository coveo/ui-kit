import {AnalyticsParam} from '../../api/search/search-api-params';
import {getPageID, getVisitorID} from '../../api/analytics/search-analytics';
import {AnalyticsState} from './configuration-state';
import {EventDescription} from 'coveo.analytics';

export const fromAnalyticsStateToAnalyticsParams = async (
  s: AnalyticsState,
  eventDescription?: EventDescription
): Promise<AnalyticsParam> => {
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
      ...(s.userDisplayName && {userDisplayName: s.userDisplayName}),
      ...(s.documentLocation && {documentLocation: s.documentLocation}),
      ...(s.deviceId && {deviceId: s.deviceId}),
      ...(getPageID() && {pageId: getPageID()}),
    },
  };
};
