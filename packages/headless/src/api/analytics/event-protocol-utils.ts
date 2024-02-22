import {createRelay} from '@coveo/relay';
import {ConfigurationState} from '../../features/configuration/configuration-state';
import {getAnalyticsSource} from './search-analytics';

export const getEmit = (state: ConfigurationState) => {
  const relayOptions = getRelayOptions(state);
  const relay = createRelay(relayOptions);
  return relay.emit;
};

const getRelayOptions = (state: ConfigurationState) => ({
  url: state.analytics.nextApiBaseUrl,
  token: state.accessToken,
  trackingId: state.analytics.trackingId,
  source: getAnalyticsSource(state.analytics),
});
