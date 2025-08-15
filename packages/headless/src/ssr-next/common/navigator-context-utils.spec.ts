import {jest} from '@jest/globals';
import type {LoggerOptions} from '../../app/logger.js';
import type {
  NavigatorContext,
  NavigatorContextProvider,
} from '../../app/navigator-context-provider.js';
import {processNavigatorContext} from './navigator-context-utils.js';

const mockAugmentPreprocessRequestWithForwardedFor = jest.fn();

jest.mock('./augment-preprocess-request.js', () => ({
  augmentPreprocessRequestWithForwardedFor:
    mockAugmentPreprocessRequestWithForwardedFor,
}));

// Type for enhanced engine options with navigator context
type EnhancedOptions = {
  configuration: Record<string, unknown>;
  loggerOptions?: LoggerOptions;
  navigatorContextProvider?: NavigatorContextProvider;
};

describe('processNavigatorContext', () => {
  const mockLoggerOptions: LoggerOptions = {
    level: 'info',
  };

  const baseOptions = {
    configuration: {},
    loggerOptions: mockLoggerOptions,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockAugmentPreprocessRequestWithForwardedFor.mockReturnValue(undefined);
  });

  describe('when no navigator context is provided', () => {
    it('returns original options unchanged', () => {
      const params = [{}];
      const result = processNavigatorContext(params, baseOptions);

      expect(result.engineOptions).toBe(baseOptions);
      expect(result.callOptions).toEqual({});
      expect(
        mockAugmentPreprocessRequestWithForwardedFor
      ).not.toHaveBeenCalled();
    });

    it('handles undefined call options', () => {
      const params = [undefined];
      const result = processNavigatorContext(params, baseOptions);

      expect(result.engineOptions).toBe(baseOptions);
      expect(result.callOptions).toBeUndefined();
    });

    it('handles empty params array', () => {
      const params: unknown[] = [];
      const result = processNavigatorContext(params, baseOptions);

      expect(result.engineOptions).toBe(baseOptions);
      expect(result.callOptions).toBeUndefined();
    });
  });

  describe('when navigator context is provided', () => {
    const mockNavigatorContext: NavigatorContext = {
      userAgent: 'Test Agent',
      location: 'https://example.com',
      referrer: 'https://referrer.com',
      clientId: 'test-client-id',
    };

    it('creates enhanced engine options with navigator context', () => {
      const callOptions = {navigatorContext: mockNavigatorContext};
      const params = [callOptions];

      const result = processNavigatorContext(params, baseOptions);

      expect(result.callOptions).toBe(callOptions);
      expect(result.engineOptions).not.toBe(baseOptions);
      expect(result.engineOptions).toHaveProperty('navigatorContextProvider');

      const enhancedOptions = result.engineOptions as EnhancedOptions;
      expect(enhancedOptions.navigatorContextProvider?.()).toBe(
        mockNavigatorContext
      );
    });

    it('enhances preprocessRequest with navigator context', () => {
      const callOptions = {navigatorContext: mockNavigatorContext};
      const params = [callOptions];

      const result = processNavigatorContext(params, baseOptions);

      const enhancedOptions = result.engineOptions as EnhancedOptions;
      expect(mockAugmentPreprocessRequestWithForwardedFor).toHaveBeenCalledWith(
        {
          preprocessRequest: undefined,
          navigatorContextProvider: enhancedOptions.navigatorContextProvider,
          loggerOptions: mockLoggerOptions,
        }
      );
    });

    it('handles call options with controllers', () => {
      const mockControllers = {search: {}, pagination: {}};
      const callOptions = {
        navigatorContext: mockNavigatorContext,
        controllers: mockControllers,
      };
      const params = [callOptions];

      const result = processNavigatorContext(params, baseOptions);

      expect(result.callOptions).toBe(callOptions);
      expect(result.callOptions?.controllers).toBe(mockControllers);
    });
  });
});
