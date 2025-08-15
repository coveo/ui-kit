import {describe, expect, it} from 'vitest';
import type {NavigatorContext} from '../../app/navigator-context-provider.js';
import {processNavigatorContext} from './navigator-context-utils.js';

describe('navigator-context-utils', () => {
  const mockNavigatorContext: NavigatorContext = {
    forwardedFor: '192.168.1.1',
    referrer: 'https://example.com',
    userAgent: 'Mozilla/5.0',
    clientId: 'test-client-id',
    location: 'https://example.com/page',
  };

  const baseOptions = {
    configuration: {},
    loggerOptions: {level: 'info' as const},
  };

  describe('processNavigatorContext', () => {
    it('should process and enhance options with navigatorContext from params', () => {
      const params = [{navigatorContext: mockNavigatorContext}];
      const result = processNavigatorContext(params, baseOptions);

      expect(result.engineOptions).not.toBe(baseOptions);
      expect(result.engineOptions).toHaveProperty('navigatorContextProvider');
      expect(result.callOptions).toEqual({
        navigatorContext: mockNavigatorContext,
      });
    });

    it('should return original options when navigatorContext is not provided', () => {
      const params = [{}];
      const result = processNavigatorContext(params, baseOptions);

      expect(result.engineOptions).toBe(baseOptions);
      expect(result.callOptions).toEqual({});
    });

    it('should return original options when params is empty', () => {
      const params: unknown[] = [];
      const result = processNavigatorContext(params, baseOptions);

      expect(result.engineOptions).toBe(baseOptions);
      expect(result.callOptions).toBeUndefined();
    });

    it('should handle callOptions with controllers', () => {
      const callOptions = {
        navigatorContext: mockNavigatorContext,
        controllers: {someController: {}},
      };
      const params = [callOptions];

      const result = processNavigatorContext(params, baseOptions);

      expect(result.callOptions).toBe(callOptions);
      expect(result.engineOptions).toHaveProperty('navigatorContextProvider');
    });
  });
});
