import {describe, expect, it} from 'vitest';
import {buildNavigatorContext, CLIENT_ID_COOKIE_NAME} from './navigator-context.js';

describe('#buildNavigatorContext', () => {
  const clientId = '3f2b1a9c-0d4e-4f6a-8b7c-9d0e1f2a3b4c';
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  it('should read the referrer, the user agent and the forwarded-for header from a Headers instance', () => {
    const headers = new Headers({
      referer: 'https://example.com/previous',
      'user-agent': 'some-user-agent',
      'x-forwarded-for': '1.2.3.4, 5.6.7.8',
    });

    const navigatorContext = buildNavigatorContext({headers, clientId});

    expect(navigatorContext).toEqual({
      clientId,
      location: null,
      referrer: 'https://example.com/previous',
      userAgent: 'some-user-agent',
      forwardedFor: '1.2.3.4, 5.6.7.8',
    });
  });

  it('should read the same headers from a plain object, regardless of the case of the keys', () => {
    const headers = {
      Referer: 'https://example.com/previous',
      'User-Agent': 'some-user-agent',
      'X-Forwarded-For': ['1.2.3.4', '5.6.7.8'],
    };

    const navigatorContext = buildNavigatorContext({headers, clientId});

    expect(navigatorContext.referrer).toBe('https://example.com/previous');
    expect(navigatorContext.userAgent).toBe('some-user-agent');
    expect(navigatorContext.forwardedFor).toBe('1.2.3.4, 5.6.7.8');
  });

  it('should fall back to the referrer header spelled with two r', () => {
    const navigatorContext = buildNavigatorContext({
      headers: {referrer: 'https://example.com/previous'},
      clientId,
    });

    expect(navigatorContext.referrer).toBe('https://example.com/previous');
  });

  it('should leave the forwarded-for property out when the header is absent', () => {
    const navigatorContext = buildNavigatorContext({headers: new Headers(), clientId});

    expect(navigatorContext).not.toHaveProperty('forwardedFor');
  });

  it('should set the location when provided', () => {
    const navigatorContext = buildNavigatorContext({
      headers: new Headers(),
      clientId,
      location: 'https://example.com/search?q=shoes',
    });

    expect(navigatorContext.location).toBe('https://example.com/search?q=shoes');
  });

  it('should keep a valid client ID', () => {
    const navigatorContext = buildNavigatorContext({headers: new Headers(), clientId});

    expect(navigatorContext.clientId).toBe(clientId);
  });

  it.each([undefined, null, '', 'not-a-uuid'])(
    'should generate a client ID when the provided one is %s',
    (invalidClientId) => {
      const navigatorContext = buildNavigatorContext({
        headers: new Headers(),
        clientId: invalidClientId,
      });

      expect(navigatorContext.clientId).toMatch(uuidPattern);
    }
  );

  it('should generate a different client ID on each call', () => {
    const first = buildNavigatorContext({headers: new Headers()});
    const second = buildNavigatorContext({headers: new Headers()});

    expect(first.clientId).not.toBe(second.clientId);
  });

  it('should let the overrides win', () => {
    const navigatorContext = buildNavigatorContext({
      headers: new Headers({'user-agent': 'some-user-agent'}),
      clientId,
      overrides: {capture: false, userAgent: 'overridden'},
    });

    expect(navigatorContext.capture).toBe(false);
    expect(navigatorContext.userAgent).toBe('overridden');
  });

  it('should expose the name of the client ID cookie', () => {
    expect(CLIENT_ID_COOKIE_NAME).toBe('coveo_visitorId');
  });
});
