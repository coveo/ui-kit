import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import type {CoveoShopifyCustomEvent} from '../types';
import {publishCustomShopifyEvent} from './shopify';

const mockCustomShopifyEvent: CoveoShopifyCustomEvent = {
  organizationId: 'org123',
  accessToken: 'token123',
  trackingId: 'tracking123',
  clientId: 'client123',
  environment: undefined,
};

describe('publishCustomShopifyEvent', () => {
  let originalShopify: typeof window.Shopify;

  beforeEach(() => {
    originalShopify = window.Shopify;
    window.Shopify = {
      analytics: {
        publish: vi.fn(),
      },
    };
  });

  afterEach(() => {
    window.Shopify = originalShopify;
  });

  it('should call Shopify.analytics.publish with the correct arguments', () => {
    const eventName = 'test_event';
    publishCustomShopifyEvent(eventName, mockCustomShopifyEvent);
    expect(window.Shopify!.analytics.publish).toHaveBeenCalledWith(
      eventName,
      mockCustomShopifyEvent
    );
  });

  it('should not throw if Shopify.analytics.publish is not a function', () => {
    window.Shopify = {
      analytics: {
        publish: undefined as unknown as (
          eventName: string,
          eventData: CoveoShopifyCustomEvent
        ) => void,
      },
    };
    expect(() =>
      publishCustomShopifyEvent('event', mockCustomShopifyEvent)
    ).not.toThrow();
  });

  it('should not throw if window.Shopify is undefined', () => {
    window.Shopify = undefined;
    expect(() =>
      publishCustomShopifyEvent('event', mockCustomShopifyEvent)
    ).not.toThrow();
  });
});
