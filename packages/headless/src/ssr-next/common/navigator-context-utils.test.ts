vi.mock('./augment-preprocess-request.js');

import {beforeEach, describe, expect, it, vi} from 'vitest';
import type {LoggerOptions} from '../../app/logger.js';
import type {NavigatorContext} from '../../app/navigator-context-provider.js';
import {augmentPreprocessRequestWithForwardedFor} from './augment-preprocess-request.js';
import {processNavigatorContext} from './navigator-context-utils.js';

const mockAugmentPreprocessRequestWithForwardedFor = vi.mocked(
  augmentPreprocessRequestWithForwardedFor
);

describe('processNavigatorContext', () => {
  const mockLoggerOptions: LoggerOptions = {
    level: 'info',
  };

  const mockNavigatorContext: NavigatorContext = {
    forwardedFor: '192.168.1.1',
    referrer: 'https://example.com',
    userAgent: 'Mozilla/5.0',
    clientId: 'test-client-id',
    location: 'https://example.com/page',
  };

  const baseOptions = {
    configuration: {},
    loggerOptions: mockLoggerOptions,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockAugmentPreprocessRequestWithForwardedFor.mockReturnValue(
      vi.fn().mockResolvedValue({})
    );
  });

  describe('when navigator context is provided', () => {
    it('should process and enhance options with navigatorContext from params', () => {
      const callOptions = {navigatorContext: mockNavigatorContext};
      const params: [typeof callOptions] = [callOptions];
      const result = processNavigatorContext(params, baseOptions);

      expect(result.engineOptions).not.toBe(baseOptions);
      expect(result.engineOptions).toHaveProperty('navigatorContextProvider');
      expect(result.callOptions).toEqual(callOptions);
      expect(result.engineOptions.navigatorContextProvider?.()).toBe(
        mockNavigatorContext
      );
    });

    it('should handle callOptions with controllers', () => {
      const mockControllers = {search: {}, pagination: {}};
      const callOptions = {
        navigatorContext: mockNavigatorContext,
        controllers: mockControllers,
      };
      const params: [typeof callOptions] = [callOptions];
      const result = processNavigatorContext(params, baseOptions);

      expect(result.callOptions).toBe(callOptions);
      expect(result.callOptions?.controllers).toBe(mockControllers);
      expect(result.engineOptions).toHaveProperty('navigatorContextProvider');
    });

    it('enhances preprocessRequest with navigator context', () => {
      const callOptions = {navigatorContext: mockNavigatorContext};
      const params: [typeof callOptions] = [callOptions];
      const result = processNavigatorContext(params, baseOptions);

      expect(mockAugmentPreprocessRequestWithForwardedFor).toHaveBeenCalledWith(
        {
          preprocessRequest: undefined,
          navigatorContextProvider:
            result.engineOptions.navigatorContextProvider,
          loggerOptions: mockLoggerOptions,
        }
      );
    });

    it('creates navigatorContextProvider that returns the provided context', () => {
      const callOptions = {navigatorContext: mockNavigatorContext};
      const params: [typeof callOptions] = [callOptions];
      const result = processNavigatorContext(params, baseOptions);
      const provider = result.engineOptions.navigatorContextProvider;
      expect(provider).toBeDefined();
      expect(provider?.()).toEqual(mockNavigatorContext);
    });

    it('preserves original configuration and merges with new preprocessRequest', () => {
      const existingPreprocessRequest = vi.fn();
      const baseOptionsWithPreprocess = {
        ...baseOptions,
        configuration: {
          ...baseOptions.configuration,
          preprocessRequest: existingPreprocessRequest,
        },
      };
      const callOptions = {navigatorContext: mockNavigatorContext};
      const params: [typeof callOptions] = [callOptions];
      processNavigatorContext(params, baseOptionsWithPreprocess);
      expect(mockAugmentPreprocessRequestWithForwardedFor).toHaveBeenCalledWith(
        expect.objectContaining({
          preprocessRequest: existingPreprocessRequest,
        })
      );
    });
  });
});
