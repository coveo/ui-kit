import {Relay} from '@coveo/relay';
import {EventDescription} from 'coveo.analytics';
import {getAnalyticsSource} from '../../api/analytics/analytics-selectors';
import {getPageID} from '../../api/analytics/search-analytics';
import {AnalyticsParam} from '../../api/search/search-api-params';
import {NavigatorContext} from '../../app/navigatorContextProvider';
import {AnalyticsState} from './configuration-state';

export const fromAnalyticsStateToAnalyticsParams = (
  s: AnalyticsState,
  navigatorContext: NavigatorContext,
  relay: Relay,
  eventDescription?: EventDescription
): AnalyticsParam => {
  return {
    analytics: {
      clientId: relay.getMeta('').clientId,
      clientTimestamp: new Date().toISOString(),
      documentReferrer: navigatorContext.referrer,
      documentLocation: navigatorContext.location,
      originContext: s.originContext,
      ...(eventDescription && {
        actionCause: eventDescription.actionCause,
      }),
      ...(eventDescription && {
        customData: eventDescription.customData,
      }),
      ...(s.userDisplayName && {userDisplayName: s.userDisplayName}),
      ...(s.deviceId && {deviceId: s.deviceId}),
      ...(getPageID() && {pageId: getPageID()}),
      ...(s.trackingId && {trackingId: s.trackingId}),
      ...{capture: true},
      ...{source: getAnalyticsSource(s)},
    },
  };
};
