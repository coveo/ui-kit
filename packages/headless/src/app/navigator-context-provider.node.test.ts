import {
  getNavigatorContext,
  type NavigatorContextProvider,
} from './navigator-context-provider.js';

describe('getNavigatorContext', () => {
  it('given nodejs environment, it returns falsy values', () => {
    expect(getNavigatorContext()).toEqual({
      referrer: null,
      userAgent: null,
      location: null,
      clientId: '',
    });
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

  it('given custom context provider, it truncates long urls', () => {
    const urlLimit = 1024;
    const longUrl = 'a'.repeat(urlLimit * 2);

    const customProvider: NavigatorContextProvider = () => {
      return {
        clientId: 'b6ab9151-5886-48b5-b254-a381ed8f8a91',
        location: longUrl,
        referrer: longUrl,
        userAgent: 'Mozilla/5.0',
      };
    };

    const context = getNavigatorContext(customProvider);

    expect(context.location).toHaveLength(urlLimit);
    expect(context.referrer).toHaveLength(urlLimit);
  });
});
