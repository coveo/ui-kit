import {createRelay} from '@coveo/relay';
import {ConfigurationState} from '../../features/configuration/configuration-state';
import {getAnalyticsSource} from './search-analytics';

export const getClientId = (
  state: ConfigurationState,
  type: string = 'ec.productView'
) => {
  const relayOptions = {
    url: state.analytics.nextApiBaseUrl,
    token: state.accessToken,
    trackingId: state.analytics.trackingId,
    source: getAnalyticsSource(state.analytics),
  };
  const relay = createRelay(relayOptions);
  const {getMeta} = relay;
  return getMeta(type).clientId;
};
