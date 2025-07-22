/**
 * @jest-environment jsdom
 */

import {
  getNavigatorContext,
  type NavigatorContextProvider,
} from './navigator-context-provider.js';

describe('getNavigatorContext', () => {
  it('given jsdom environment, it returns browser values', () => {
    const referrerUrl = 'http://example.com/referrer';
    const locationUrl = 'http://example.com/';
    const userAgent = 'Mozilla/5.0';

    Object.defineProperty(window.document, 'referrer', {value: referrerUrl});
    Object.defineProperty(navigator, 'userAgent', {value: userAgent});
    Object.defineProperty(window, 'location', {
      value: new URL(locationUrl),
      writable: true,
    });

    const context = getNavigatorContext();

    expect(Object.keys(context).length).toBe(4);
    expect(context.clientId).toHaveLength(36);
    expect(context.referrer).toBe(referrerUrl);
    expect(context.userAgent).toBe(userAgent);
    expect(context.location).toBe(locationUrl);
  });

  it('given custom context provider, it returns the values from the custom provider', () => {
    const customProvider: NavigatorContextProvider = () => {
      return {
        clientId: 'b6ab9151-5886-48b5-b254-a381ed8f8a91',
        location: 'http://example.com/',
        referrer: 'http://example.com/referrer',
        userAgent: 'Mozilla/5.0',
        capture: true,
        forwardedFor: '203.0.113.195',
      };
    };

    expect(getNavigatorContext(customProvider)).toEqual(customProvider());
  });
});
