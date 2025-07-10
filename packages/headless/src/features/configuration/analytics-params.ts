import type {EventDescription} from 'coveo.analytics';
import {getAnalyticsSource} from '../../api/analytics/analytics-selectors.js';
import type {AnalyticsParam} from '../../api/search/search-api-params.js';
import type {NavigatorContext} from '../../app/navigator-context-provider.js';
import type {AnalyticsState} from './configuration-state.js';

export const fromAnalyticsStateToAnalyticsParams = (
  s: AnalyticsState,
  navigatorContext: NavigatorContext,
  eventDescription?: EventDescription
): AnalyticsParam => {
  return {
    analytics: {
      clientId: navigatorContext.clientId,
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
      ...(s.trackingId && {trackingId: s.trackingId}),
      ...{
        capture: navigatorContext.capture ?? navigatorContext.clientId !== '',
      },
      ...{source: getAnalyticsSource(s)},
    },
  };
};
