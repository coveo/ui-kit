import type {Mock, MockInstance} from 'vitest';
import {getSampleCommerceEngineConfiguration} from '../../../app/commerce-engine/commerce-engine-configuration.js';
import {buildMockCommerceState} from '../../../test/mock-commerce-state.js';
import {buildMockSSRCommerceEngine} from '../../../test/mock-engine-v2.js';
import {defineRecommendations} from '../controllers/recommendations/headless-recommendations.ssr.js';
import type {SolutionType} from '../types/controller-constants.js';
import type {FilteredBakedInControllers} from '../types/controller-definitions.js';
import type {InferControllersMapFromDefinition} from '../types/controller-inference.js';
import type {CommerceControllerDefinitionsMap} from '../types/engine.js';
import * as buildFactory from './build-factory.js';
import {fetchRecommendationStaticStateFactory} from './recommendation-static-state-factory.js';

describe('fetchRecommendationStaticStateFactory', () => {
  let engineSpy: MockInstance;
  const mockEngine = buildMockSSRCommerceEngine(buildMockCommerceState());

  const createEngineOptions = () => ({
    configuration: getSampleCommerceEngineConfiguration(),
    navigatorContextProvider: vi.fn(),
  });

  const createControllerDefinitions = () => ({
    popularViewed: defineRecommendations({
      options: {
        slotId: 'slot_1',
      },
    }),
    popularBought: defineRecommendations({
      options: {
        slotId: 'slot_2',
      },
    }),
  });

  beforeEach(() => {
    engineSpy = vi.spyOn(buildFactory, 'buildFactory').mockReturnValue(
      <T extends SolutionType>(_: T) =>
        async () =>
          Promise.resolve({
            engine: mockEngine,
            controllers: {} as InferControllersMapFromDefinition<
              CommerceControllerDefinitionsMap,
              T
            > &
              FilteredBakedInControllers<T>,
          })
    );

    (mockEngine.waitForRequestCompletedAction as Mock).mockReturnValue([]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should call buildFactory with the correct parameters', async () => {
    const controllerDefinitions = createControllerDefinitions();
    const options = createEngineOptions();

    const factory = fetchRecommendationStaticStateFactory(
      // @ts-expect-error: do not care about baked-in controller initial state
      controllerDefinitions,
      options
    );

    // @ts-expect-error: TODO: KIT-4619: Provide recommendation array
    await factory({
      country: 'CA',
      currency: 'USD',
      language: 'en',
      url: 'https://example.com',
    });

    expect(engineSpy).toHaveBeenCalledWith(controllerDefinitions, options);
  });
});
