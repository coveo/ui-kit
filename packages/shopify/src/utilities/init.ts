import {getAnalyticsNextApiBaseUrl} from '@coveo/headless';
import {createRelay} from '@coveo/relay';
import {COVEO_SHOPIFY_CONFIG_KEY} from '../constants';
import type {CoveoShopifyOptions} from '../types';
import {publishCustomShopifyEvent} from './shopify';

export function init(options: CoveoShopifyOptions) {
  const relay = createRelay({
    url: getAnalyticsNextApiBaseUrl(
      options.organizationId,
      options.environment
    ),
    token: options.accessToken,
    trackingId: options.trackingId,
  });
  const clientId = relay.getMeta('').clientId;

  publishCustomShopifyEvent(COVEO_SHOPIFY_CONFIG_KEY, {
    ...options,
    clientId,
  });
}
