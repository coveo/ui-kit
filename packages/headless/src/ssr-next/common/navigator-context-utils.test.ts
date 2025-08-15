import {describe, expect, it} from 'vitest';
import type {NavigatorContext} from '../../app/navigator-context-provider.js';
import {
  convertNavigatorContextToProvider,
  extractCallOptionsAndNavigatorContextProvider,
  extractNavigatorContextProvider,
} from './navigator-context-utils.js';

describe('navigator-context-utils', () => {
  const mockNavigatorContext: NavigatorContext = {
    forwardedFor: '192.168.1.1',
    referrer: 'https://example.com',
    userAgent: 'Mozilla/5.0',
    clientId: 'test-client-id',
    location: 'https://example.com/page',
  };

  describe('convertNavigatorContextToProvider', () => {
    it('should convert NavigatorContext to NavigatorContextProvider', () => {
      const provider = convertNavigatorContextToProvider(mockNavigatorContext);

      expect(typeof provider).toBe('function');
      expect(provider()).toEqual(mockNavigatorContext);
    });

    it('should return the same context object on multiple calls', () => {
      const provider = convertNavigatorContextToProvider(mockNavigatorContext);

      expect(provider()).toBe(mockNavigatorContext);
      expect(provider()).toBe(mockNavigatorContext);
    });
  });

  describe('extractNavigatorContextProvider', () => {
    it('should extract and convert navigatorContext from params', () => {
      const params = [{navigatorContext: mockNavigatorContext}];
      const provider = extractNavigatorContextProvider(params);

      expect(typeof provider).toBe('function');
      expect(provider!()).toEqual(mockNavigatorContext);
    });

    it('should return undefined when navigatorContext is not provided', () => {
      const params = [{}];
      const provider = extractNavigatorContextProvider(params);

      expect(provider).toBeUndefined();
    });

    it('should return undefined when params is empty', () => {
      const params: unknown[] = [];
      const provider = extractNavigatorContextProvider(params);

      expect(provider).toBeUndefined();
    });

    it('should return undefined when first param is undefined', () => {
      const params = [undefined];
      const provider = extractNavigatorContextProvider(params);

      expect(provider).toBeUndefined();
    });
  });

  describe('extractCallOptionsAndNavigatorContextProvider', () => {
    it('should extract both callOptions and navigatorContextProvider', () => {
      const callOptions = {
        navigatorContext: mockNavigatorContext,
        controllers: {someController: {}},
      };
      const params = [callOptions];

      const result = extractCallOptionsAndNavigatorContextProvider(params);

      expect(result.callOptions).toBe(callOptions);
      expect(typeof result.navigatorContextProvider).toBe('function');
      expect(result.navigatorContextProvider!()).toEqual(mockNavigatorContext);
    });

    it('should handle callOptions without navigatorContext', () => {
      const callOptions = {controllers: {someController: {}}};
      const params = [callOptions];

      const result = extractCallOptionsAndNavigatorContextProvider(params);

      expect(result.callOptions).toBe(callOptions);
      expect(result.navigatorContextProvider).toBeUndefined();
    });

    it('should handle empty params', () => {
      const params: unknown[] = [];

      const result = extractCallOptionsAndNavigatorContextProvider(params);

      expect(result.callOptions).toBeUndefined();
      expect(result.navigatorContextProvider).toBeUndefined();
    });

    it('should handle undefined callOptions', () => {
      const params = [undefined];

      const result = extractCallOptionsAndNavigatorContextProvider(params);

      expect(result.callOptions).toBeUndefined();
      expect(result.navigatorContextProvider).toBeUndefined();
    });

    it('should preserve other properties in callOptions', () => {
      const callOptions = {
        navigatorContext: mockNavigatorContext,
        controllers: {someController: {}},
        someOtherProperty: 'test',
      };
      const params = [callOptions];

      const result = extractCallOptionsAndNavigatorContextProvider(params);

      expect(result.callOptions).toBe(callOptions);
      expect(result.callOptions).toHaveProperty('someOtherProperty', 'test');
    });
  });
});
