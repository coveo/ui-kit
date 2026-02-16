import {beforeEach, describe, expect, it, vi} from 'vitest';
import {getSampleCommerceEngineConfiguration} from '../../../app/commerce-engine/commerce-engine-configuration.js';
import {buildLogger} from '../../../app/logger.js';
import {buildMockCommerceContext} from '../../../test/mock-context.js';
import {buildMockNavigatorContext} from '../../../test/mock-navigator-context.js';
import {augmentPreprocessRequestWithForwardedFor} from '../../common/augment-preprocess-request.js';
import type {CommonBuildConfig} from '../types/build.js';
import {augmentCommerceEngineOptions} from './engine-wiring.js';

vi.mock('../../common/augment-preprocess-request.js');
vi.mock('../../../app/logger.js');

// Type for testing missing navigatorContext
type BuildConfigWithout = Omit<CommonBuildConfig, 'navigatorContext'>;

describe('#augmentCommerceEngineOptions', () => {
  const sampleCommerceConfig = {
    configuration: getSampleCommerceEngineConfiguration(),
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

      const engineOptions = augmentCommerceEngineOptions(sampleCommerceConfig, {
        navigatorContext,
        context: buildMockCommerceContext(),
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

      augmentCommerceEngineOptions(
        {
          configuration: {
            ...sampleCommerceConfig.configuration,
            preprocessRequest: mockedPreprocessRequest,
          },
        },
        {
          navigatorContext,
          context: buildMockCommerceContext(),
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
      const buildConfigWithout: BuildConfigWithout = {
        context: buildMockCommerceContext(),
      };

      const engineOptions = augmentCommerceEngineOptions(
        sampleCommerceConfig,
        buildConfigWithout as CommonBuildConfig
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
      const buildConfigWithout: BuildConfigWithout = {
        context: buildMockCommerceContext(),
      };

      augmentCommerceEngineOptions(
        sampleCommerceConfig,
        buildConfigWithout as CommonBuildConfig
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

  describe('context and cart configuration', () => {
    it('should set the context fields from buildConfig', () => {
      const navigatorContext = createNavigatorContext();

      const engineOptions = augmentCommerceEngineOptions(sampleCommerceConfig, {
        navigatorContext,
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
      const navigatorContext = createNavigatorContext();

      const engineOptions = augmentCommerceEngineOptions(sampleCommerceConfig, {
        navigatorContext,
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
