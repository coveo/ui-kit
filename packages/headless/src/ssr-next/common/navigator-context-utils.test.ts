import {describe, expect, it} from 'vitest';
import type {NavigatorContext} from '../../app/navigator-context-provider.js';
import {
  createEngineOptionsWithNavigatorContext,
  extractNavigatorContextConfig,
} from './navigator-context-utils.js';

describe('navigator-context-utils', () => {
  const mockNavigatorContext: NavigatorContext = {
    forwardedFor: '192.168.1.1',
    referrer: 'https://example.com',
    userAgent: 'Mozilla/5.0',
    clientId: 'test-client-id',
    location: 'https://example.com/page',
  };

  describe('extractNavigatorContextConfig', () => {
    it('should extract and convert navigatorContext from params', () => {
      const params = [{navigatorContext: mockNavigatorContext}];
      const result = extractNavigatorContextConfig(params);

      expect(typeof result.navigatorContextProvider).toBe('function');
      expect(result.navigatorContextProvider!()).toEqual(mockNavigatorContext);
      expect(result.callOptions).toEqual({
        navigatorContext: mockNavigatorContext,
      });
    });

    it('should return only callOptions when navigatorContext is not provided', () => {
      const params = [{}];
      const result = extractNavigatorContextConfig(params);

      expect(result.navigatorContextProvider).toBeUndefined();
      expect(result.callOptions).toEqual({});
    });

    it('should return callOptions undefined when params is empty', () => {
      const params: unknown[] = [];
      const result = extractNavigatorContextConfig(params);

      expect(result.navigatorContextProvider).toBeUndefined();
      expect(result.callOptions).toBeUndefined();
    });

    it('should handle callOptions with controllers', () => {
      const callOptions = {
        navigatorContext: mockNavigatorContext,
        controllers: {someController: {}},
      };
      const params = [callOptions];

      const result = extractNavigatorContextConfig(params);

      expect(result.callOptions).toBe(callOptions);
      expect(typeof result.navigatorContextProvider).toBe('function');
      expect(result.navigatorContextProvider!()).toEqual(mockNavigatorContext);
    });
  });

  describe('createEngineOptionsWithNavigatorContext', () => {
    const mockBaseOptions = {
      configuration: {
        preprocessRequest: undefined,
      },
      loggerOptions: {},
    };

    it('should return base options when no navigatorContextProvider', () => {
      const result = createEngineOptionsWithNavigatorContext(mockBaseOptions);

      expect(result).toBe(mockBaseOptions);
    });

    it('should enhance options with navigatorContextProvider', () => {
      const navigatorContextProvider = () => mockNavigatorContext;
      const result = createEngineOptionsWithNavigatorContext(
        mockBaseOptions,
        navigatorContextProvider
      );

      expect(
        (result as typeof result & {navigatorContextProvider: unknown})
          .navigatorContextProvider
      ).toBe(navigatorContextProvider);
      expect(result.configuration.preprocessRequest).toBeDefined();
    });

    it('should preserve existing configuration', () => {
      const existingPreprocessRequest = () => {};
      const optionsWithConfig = {
        ...mockBaseOptions,
        configuration: {
          preprocessRequest: existingPreprocessRequest,
          someOtherConfig: 'test',
        },
      };

      const navigatorContextProvider = () => mockNavigatorContext;
      const result = createEngineOptionsWithNavigatorContext(
        optionsWithConfig,
        navigatorContextProvider
      );

      expect(result.configuration.someOtherConfig).toBe('test');
      expect(result.configuration.preprocessRequest).not.toBe(
        existingPreprocessRequest
      );
    });
  });
});
