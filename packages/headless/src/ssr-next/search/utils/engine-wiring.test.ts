import {beforeEach, describe, expect, it, vi} from 'vitest';
import {buildLogger} from '../../../app/logger.js';
import {getSampleSearchEngineConfiguration} from '../../../app/search-engine/search-engine-configuration.js';
import {buildMockNavigatorContext} from '../../../test/mock-navigator-context.js';
import {augmentPreprocessRequestWithForwardedFor} from '../../common/augment-preprocess-request.js';
import type {BuildConfig} from '../types/build.js';
import {augmentSearchEngineOptions} from './engine-wiring.js';

vi.mock('../../common/augment-preprocess-request.js');
vi.mock('../../../app/logger.js');

// Type for testing missing navigatorContext
type BuildConfigWithout = Omit<BuildConfig, 'navigatorContext'>;

describe('#augmentSearchEngineOptions', () => {
  const sampleSearchConfig = {
    configuration: getSampleSearchEngineConfiguration(),
  };

  const mockLogger = {
    error: vi.fn(),
    level: 'info' as const,
  };

  const createNavigatorContext = (options = {}) =>
    buildMockNavigatorContext({
      clientId: 'test-client-id',
      ...options,
    });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(buildLogger).mockReturnValue(
      mockLogger as unknown as ReturnType<typeof buildLogger>
    );
  });

  describe('when navigatorContext is provided', () => {
    it('should set the navigatorContext in the engine options', () => {
      const navigatorContext = createNavigatorContext({
        userAgent: 'Mozilla/5.0',
        location: 'https://example.com',
        referrer: 'https://google.com',
      });

      const engineOptions = augmentSearchEngineOptions(sampleSearchConfig, {
        navigatorContext,
      });

      expect(engineOptions.navigatorContextProvider?.()).not.toBeUndefined();
      expect(engineOptions.navigatorContextProvider?.()).toBe(navigatorContext);
      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('should call #augmentPreprocessRequestWithForwardedFor with the correct arguments', () => {
      const mockedPreprocessRequest = vi.fn();
      const mockedAugmentPreprocessRequestWithForwardedFor = vi.mocked(
        augmentPreprocessRequestWithForwardedFor
      );
      const navigatorContext = createNavigatorContext({
        forwardedFor: '192.168.1.1',
      });

      augmentSearchEngineOptions(
        {
          configuration: {
            ...sampleSearchConfig.configuration,
            preprocessRequest: mockedPreprocessRequest,
          },
        },
        {
          navigatorContext,
        }
      );

      expect(
        mockedAugmentPreprocessRequestWithForwardedFor
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          navigatorContext: {
            clientId: 'test-client-id',
            forwardedFor: '192.168.1.1',
            referrer: 'some-test-referrer',
            location: '',
            userAgent: '',
          },
          preprocessRequest: mockedPreprocessRequest,
        })
      );
    });
  });

  describe('when navigatorContext is not provided', () => {
    it('should log an error and set navigatorContext to undefined', () => {
      const buildConfigWithout: BuildConfigWithout = {};

      const engineOptions = augmentSearchEngineOptions(
        sampleSearchConfig,
        buildConfigWithout as BuildConfig
      );

      expect(engineOptions.navigatorContextProvider?.()).toBeUndefined();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'No navigatorContext was provided. This may impact analytics accuracy, personalization, and session tracking. Refer to the Coveo documentation on server-side navigation context for implementation guidance.'
      );
    });

    it('should still call augmentPreprocessRequestWithForwardedFor', () => {
      const mockedAugmentPreprocessRequestWithForwardedFor = vi.mocked(
        augmentPreprocessRequestWithForwardedFor
      );
      const buildConfigWithout: BuildConfigWithout = {};

      augmentSearchEngineOptions(
        sampleSearchConfig,
        buildConfigWithout as BuildConfig
      );

      expect(
        mockedAugmentPreprocessRequestWithForwardedFor
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          navigatorContext: undefined,
        })
      );
    });
  });
});
