import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {
  publishCustomShopifyEvent,
  CustomEvent,
  getShopifyCookie,
} from './shopify';

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
    const eventData: CustomEvent = {foo: 'bar'};
    publishCustomShopifyEvent(eventName, eventData);
    expect(window.Shopify!.analytics.publish).toHaveBeenCalledWith(
      eventName,
      eventData
    );
  });

  it('should not throw if Shopify.analytics.publish is not a function', () => {
    window.Shopify = {analytics: {publish: () => {}}};
    expect(() =>
      publishCustomShopifyEvent('event', {foo: 'bar'})
    ).not.toThrow();
  });

  it('should not throw if window.Shopify is undefined', () => {
    window.Shopify = undefined;
    expect(() =>
      publishCustomShopifyEvent('event', {foo: 'bar'})
    ).not.toThrow();
  });
});

describe('getShopifyCookie', () => {
  let originalCookie: PropertyDescriptor | undefined;

  beforeEach(() => {
    originalCookie = Object.getOwnPropertyDescriptor(document, 'cookie');
  });

  afterEach(() => {
    if (originalCookie) {
      Object.defineProperty(document, 'cookie', originalCookie);
    }
  });

  it('should return the value of the _shopify_y cookie', () => {
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: '_shopify_y=abc123; other=val',
    });
    expect(getShopifyCookie()).toBe('abc123');
  });

  it('should return null if the cookie is not found', () => {
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: 'other=val',
    });
    expect(getShopifyCookie()).toBeNull();
  });

  it('should decode URI components in the cookie value', () => {
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: '_shopify_y=abc%20123',
    });
    expect(getShopifyCookie()).toBe('abc 123');
  });

  it('should return the value of a custom cookie name', () => {
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: 'custom_cookie=customValue',
    });
    expect(getShopifyCookie('custom_cookie')).toBe('customValue');
  });
});
