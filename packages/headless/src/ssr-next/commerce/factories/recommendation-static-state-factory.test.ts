import type {Mock, MockInstance} from 'vitest';
import {getSampleCommerceEngineConfiguration} from '../../../app/commerce-engine/commerce-engine-configuration.js';
import {buildMockCommerceState} from '../../../test/mock-commerce-state.js';
import {buildMockSSRCommerceEngine} from '../../../test/mock-engine-v2.js';
import {defineMockRecommendationDefinition} from '../../../test/mock-ssr-controller-definitions.js';
import type {SolutionType} from '../types/controller-constants.js';
import type {FilteredBakedInControllers} from '../types/controller-definitions.js';
import type {InferControllersMapFromDefinition} from '../types/controller-inference.js';
import type {CommerceControllerDefinitionsMap} from '../types/engine.js';
import * as buildFactory from './build-factory.js';
import {fetchRecommendationStaticStateFactory} from './recommendation-static-state-factory.js';

describe('fetchRecommendationStaticStateFactory', () => {
  let engineSpy: MockInstance;
  let mockControllers = {};
  let mockEngine: ReturnType<typeof buildMockSSRCommerceEngine>;
  let options: ReturnType<typeof getSampleCommerceEngineConfiguration> & {
    navigatorContextProvider: Mock;
  };
  let controllerDefinitions: {
    rec1: ReturnType<typeof defineMockRecommendationDefinition>;
    rec2: ReturnType<typeof defineMockRecommendationDefinition>;
    rec3: ReturnType<typeof defineMockRecommendationDefinition>;
  };

  const setupMocks = () => {
    mockEngine = buildMockSSRCommerceEngine(buildMockCommerceState());

    options = {
      ...getSampleCommerceEngineConfiguration(),
      navigatorContextProvider: vi.fn(),
    };

    controllerDefinitions = {
      rec1: defineMockRecommendationDefinition('slot_1'),
      rec2: defineMockRecommendationDefinition('slot_2'),
      rec3: defineMockRecommendationDefinition('slot_3'),
    };

    engineSpy = vi.spyOn(buildFactory, 'buildFactory').mockReturnValue(
      <T extends SolutionType>(_: T) =>
        async () =>
          Promise.resolve({
            engine: mockEngine,
            controllers: mockControllers as InferControllersMapFromDefinition<
              CommerceControllerDefinitionsMap,
              T
            > &
              FilteredBakedInControllers<T>,
          })
    );

    (mockEngine.waitForRequestCompletedAction as Mock).mockReturnValue([]);
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  beforeEach(() => {
    mockControllers = {rec1: {}, rec2: {}};
    setupMocks();
  });

  it('should call buildFactory with the correct parameters', async () => {
    const factory = fetchRecommendationStaticStateFactory(
      // @ts-expect-error: do not care about baked-in controller initial state
      controllerDefinitions,
      options
    );

    await factory({
      country: 'CA',
      currency: 'USD',
      language: 'fr',
      url: 'https://example.com',
    });

    expect(engineSpy).toHaveBeenCalledWith(controllerDefinitions, options);
  });
});
