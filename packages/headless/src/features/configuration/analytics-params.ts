import {EventDescription} from 'coveo.analytics';
// import {getVisitorID} from '../../api/analytics/coveo-analytics-utils';
import {getPageID} from '../../api/analytics/search-analytics';
import {AnalyticsParam} from '../../api/search/search-api-params';
import {AnalyticsState} from './configuration-state';

export const fromAnalyticsStateToAnalyticsParams = async (
  s: AnalyticsState,
  eventDescription?: EventDescription
): Promise<AnalyticsParam> => {
  return {
    analytics: {
      clientId:
        '🍕🐶🌞🎉🚀🌈🍔🍩🎸🎨🎮🎲📚💻📱🎧🎤🎬🍺🍷🍹🍸🍾🍿🍪🍫🍭🍦🍰🎂🍎🍊🍇🍓🍉🍌🍐🍒🍑🥝🥑🥕🌽🥦🍆🍅🧀🥓🥩🍗🍖🌮🌯🥙🥪🍱🍲🍛🍜🍝🍠🍢🍣🍤🍥🥠🥟🥡🍧🍨🍮🍭🍬🍫🍿🍩🍪🥤🍺🍻🍷🍸🍹🍾',
      clientTimestamp: 'new Date().toISOString()',
      documentReferrer: 'baguette',
      originContext: 'baguette',
      ...(eventDescription && {
        actionCause: 'baguette',
        customData: {},
      }),
      ...(s.userDisplayName && {userDisplayName: 'baguette'}),
      ...(s.documentLocation && {documentLocation: 'baguette'}),
      ...(s.deviceId && {deviceId: 'baguette'}),
      ...(getPageID() && {pageId: 'baguette'}),
      ...(s.analyticsMode && s.trackingId && {trackingId: s.trackingId}),
    },
  };
};
