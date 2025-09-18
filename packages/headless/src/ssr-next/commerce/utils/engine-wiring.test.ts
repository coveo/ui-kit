import {beforeEach, describe, expect, it, vi} from 'vitest';
import {getSampleCommerceEngineConfiguration} from '../../../app/commerce-engine/commerce-engine-configuration.js';
import {buildLogger} from '../../../app/logger.js';
import {buildMockCommerceContext} from '../../../test/mock-context.js';
import {buildMockNavigatorContextProvider} from '../../../test/mock-navigator-context-provider.js';
import {augmentPreprocessRequestWithForwardedFor} from '../../common/augment-preprocess-request.js';
import type {CommonBuildConfig} from '../types/build.js';
import {augmentCommerceEngineOptions} from './engine-wiring.js';

vi.mock('../../common/augment-preprocess-request.js');
vi.mock('../../../app/logger.js');

// Type for testing missing navigatorContextProvider
type BuildConfigWithoutProvider = Omit<
  CommonBuildConfig,
  'navigatorContextProvider'
>;

describe('#augmentCommerceEngineOptions', () => {
  const sampleCommerceConfig = {
    configuration: getSampleCommerceEngineConfiguration(),
  };

  const mockLogger = {
    error: vi.fn(),
    level: 'info' as const,
  };

  const createNavigatorContextProvider = (options = {}) =>
    buildMockNavigatorContextProvider({
      clientId: 'test-client-id',
      ...options,
    });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(buildLogger).mockReturnValue(
      mockLogger as unknown as ReturnType<typeof buildLogger>
    );
  });

  describe('when navigatorContextProvider is provided', () => {
    it('should set the navigatorContextProvider in the engine options', () => {
      const navigatorContextProvider = createNavigatorContextProvider({
        userAgent: 'Mozilla/5.0',
        location: 'https://example.com',
        referrer: 'https://google.com',
      });

      const engineOptions = augmentCommerceEngineOptions(sampleCommerceConfig, {
        navigatorContextProvider,
        context: buildMockCommerceContext(),
      });

      expect(engineOptions.navigatorContextProvider).toBe(
        navigatorContextProvider
      );
      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('should call #augmentPreprocessRequestWithForwardedFor with the correct arguments', () => {
      const mockedPreprocessRequest = vi.fn();
      const mockedAugmentPreprocessRequestWithForwardedFor = vi.mocked(
        augmentPreprocessRequestWithForwardedFor
      );
      const navigatorContextProvider = createNavigatorContextProvider({
        forwardedFor: '192.168.1.1',
      });

      augmentCommerceEngineOptions(
        {
          configuration: {
            ...sampleCommerceConfig.configuration,
            preprocessRequest: mockedPreprocessRequest,
          },
        },
        {
          navigatorContextProvider,
          context: buildMockCommerceContext(),
        }
      );

      expect(
        mockedAugmentPreprocessRequestWithForwardedFor
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          navigatorContextProvider: expect.any(Function),
          preprocessRequest: mockedPreprocessRequest,
        })
      );
    });
  });

  describe('when navigatorContextProvider is not provided', () => {
    it('should log an error and set navigatorContextProvider to undefined', () => {
      const buildConfigWithoutProvider: BuildConfigWithoutProvider = {
        context: buildMockCommerceContext(),
      };

      const engineOptions = augmentCommerceEngineOptions(
        sampleCommerceConfig,
        buildConfigWithoutProvider as CommonBuildConfig
      );

      expect(engineOptions.navigatorContextProvider).toBeUndefined();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'No navigatorContextProvider was provided. This may impact analytics accuracy, personalization, and session tracking. Refer to the Coveo documentation on server-side navigation context for implementation guidance.'
      );
    });

    it('should still call augmentPreprocessRequestWithForwardedFor', () => {
      const mockedAugmentPreprocessRequestWithForwardedFor = vi.mocked(
        augmentPreprocessRequestWithForwardedFor
      );
      const buildConfigWithoutProvider: BuildConfigWithoutProvider = {
        context: buildMockCommerceContext(),
      };

      augmentCommerceEngineOptions(
        sampleCommerceConfig,
        buildConfigWithoutProvider as CommonBuildConfig
      );

      expect(
        mockedAugmentPreprocessRequestWithForwardedFor
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          navigatorContextProvider: undefined,
        })
      );
    });
  });

  describe('context and cart configuration', () => {
    it('should set the context fields from buildConfig', () => {
      const navigatorContextProvider = createNavigatorContextProvider();

      const engineOptions = augmentCommerceEngineOptions(sampleCommerceConfig, {
        navigatorContextProvider,
        context: {
          ...buildMockCommerceContext(),
          location: {latitude: 37.7749, longitude: -122.4194},
        },
      });

      expect(engineOptions.configuration.context).toEqual({
        view: {url: 'https://example.com'},
        language: 'some-language',
        country: 'some-country',
        location: {latitude: 37.7749, longitude: -122.4194},
        currency: 'some-currency',
      });
    });

    it('should set the cart field from buildConfig', () => {
      const navigatorContextProvider = createNavigatorContextProvider();

      const engineOptions = augmentCommerceEngineOptions(sampleCommerceConfig, {
        navigatorContextProvider,
        context: buildMockCommerceContext(),
        cart: {
          items: [{name: 'foo', price: 10, productId: 'foo_id', quantity: 1}],
        },
      });

      expect(engineOptions.configuration.cart).toEqual({
        items: [
          {
            name: 'foo',
            price: 10,
            productId: 'foo_id',
            quantity: 1,
          },
        ],
      });
    });
  });
});
