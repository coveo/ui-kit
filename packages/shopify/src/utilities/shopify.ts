import type {CoveoShopifyCustomEvent} from '../types';

export type {CoveoShopifyCustomEvent} from '../types';

declare global {
  interface Window {
    Shopify?: {
      analytics: {
        publish: (
          eventName: string,
          eventData: CoveoShopifyCustomEvent
        ) => void;
      };
    };
  }
}

export function publishCustomShopifyEvent(
  key: string,
  customData: CoveoShopifyCustomEvent
) {
  if (typeof window.Shopify?.analytics?.publish === 'function') {
    window.Shopify.analytics.publish(key, customData);
  }
}
