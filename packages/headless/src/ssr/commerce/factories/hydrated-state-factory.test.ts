import {describe, expect, it, type Mock, vi} from 'vitest';
import * as commerceEngine from '../../../app/commerce-engine/commerce-engine.js';
import {getSampleCommerceEngineConfiguration} from '../../../app/commerce-engine/commerce-engine-configuration.js';
import {buildMockNavigatorContextProvider} from '../../../test/mock-navigator-context-provider.js';
import {SolutionType} from '../types/controller-constants.js';
import type {CommerceEngineDefinitionOptions} from './build-factory.js';
import {hydratedStaticStateFactory} from './hydrated-state-factory.js';

describe('hydratedStaticStateFactory', () => {
  const definitionToken = 'definition-token';

  const createEngineOptions = (
    overrides: Partial<CommerceEngineDefinitionOptions> = {}
  ): CommerceEngineDefinitionOptions => ({
    configuration: {...getSampleCommerceEngineConfiguration(), accessToken: definitionToken},
    navigatorContextProvider: buildMockNavigatorContextProvider(),
    ...overrides,
  });

  const engineConfigurationOf = (callIndex: number) =>
    (commerceEngine.buildCommerceEngine as Mock).mock.calls[callIndex][0].configuration;

  beforeEach(() => {
    vi.spyOn(commerceEngine, 'buildCommerceEngine');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('per-request access token', () => {
    it('should build the engine with the per-request access token when provided', async () => {
      const hydrate = hydratedStaticStateFactory({}, createEngineOptions())(SolutionType.listing);

      await hydrate({searchActions: [], accessToken: 'per-request-token'});

      expect(engineConfigurationOf(0).accessToken).toBe('per-request-token');
    });

    it('should fall back to the definition access token when none is provided', async () => {
      const hydrate = hydratedStaticStateFactory({}, createEngineOptions())(SolutionType.listing);

      await hydrate({searchActions: []});

      expect(engineConfigurationOf(0).accessToken).toBe(definitionToken);
    });

    it('should not mutate the shared definition configuration', async () => {
      const options = createEngineOptions();
      const hydrate = hydratedStaticStateFactory({}, options)(SolutionType.listing);

      await hydrate({searchActions: [], accessToken: 'per-request-token'});

      expect(options.configuration.accessToken).toBe(definitionToken);
    });

    it('should keep the hydrated engine subscribed to shared token updates', async () => {
      const onAccessTokenUpdate = vi.fn();
      const hydrate = hydratedStaticStateFactory(
        {},
        createEngineOptions({onAccessTokenUpdate})
      )(SolutionType.listing);

      const {engine} = await hydrate({searchActions: [], accessToken: 'per-request-token'});

      expect(onAccessTokenUpdate).toHaveBeenCalledWith(expect.any(Function), engine);
    });
  });
});
