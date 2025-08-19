import type {Mock, MockInstance} from 'vitest';
import {getSampleCommerceEngineConfiguration} from '../../../app/commerce-engine/commerce-engine-configuration.js';
import {buildMockCommerceState} from '../../../test/mock-commerce-state.js';
import {buildMockSSRCommerceEngine} from '../../../test/mock-engine-v2.js';
import {defineMockRecommendationDefinition} from '../../../test/mock-ssr-controller-definitions.js';
import type {SolutionType} from '../types/controller-constants.js';
import type {FilteredBakedInControllers} from '../types/controller-definitions.js';
import type {InferControllersMapFromDefinition} from '../types/controller-inference.js';
import type {CommerceControllerDefinitionsMap} from '../types/engine.js';
import * as recommendationHelpers from '../utils/recommendations/recommendation-helpers.js';
import * as controllerValidation from '../validation/controller-validation.js';
import * as buildFactory from './build-factory.js';
import {fetchRecommendationStaticStateFactory} from './recommendation-static-state-factory.js';

describe('fetchRecommendationStaticStateFactory', () => {
  let engineSpy: MockInstance;
  let mockControllers = {};
  let getRecommendationDefinitionsSpy: MockInstance;
  let validateUniqueRecommendationSlotIdsSpy: MockInstance;
  let refreshRecommendationControllersSpy: MockInstance;
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

    getRecommendationDefinitionsSpy = vi.spyOn(
      recommendationHelpers,
      'getRecommendationDefinitions'
    );
    validateUniqueRecommendationSlotIdsSpy = vi.spyOn(
      controllerValidation,
      'validateUniqueRecommendationSlotIds'
    );
    refreshRecommendationControllersSpy = vi.spyOn(
      recommendationHelpers,
      'refreshRecommendationControllers'
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

  it('should call getRecommendationDefinitions with the controller definitions', async () => {
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

    expect(getRecommendationDefinitionsSpy).toHaveBeenCalledWith(
      controllerDefinitions
    );
  });

  it('should call #validateUniqueRecommendationSlotIds with the recommendation definitions', async () => {
    const mockRecommendationDefinitions = {rec1: controllerDefinitions.rec1};

    getRecommendationDefinitionsSpy.mockReturnValue(
      mockRecommendationDefinitions
    );

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

    expect(validateUniqueRecommendationSlotIdsSpy).toHaveBeenCalledWith(
      mockRecommendationDefinitions
    );
  });

  it('should call #refreshRecommendationControllers with the correct arguments', async () => {
    getRecommendationDefinitionsSpy.mockReturnValue({
      rec1: controllerDefinitions.rec1,
    });

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
      recommendations: ['rec1', 'rec2'],
    });

    expect(refreshRecommendationControllersSpy).toHaveBeenCalledWith(
      mockControllers,
      {rec1: controllerDefinitions.rec1},
      ['rec1', 'rec2']
    );
  });

  it('should handle empty recommendations array', async () => {
    getRecommendationDefinitionsSpy.mockReturnValue({
      rec1: controllerDefinitions.rec1,
    });

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
      recommendations: [],
    });

    expect(refreshRecommendationControllersSpy).toHaveBeenCalledWith(
      mockControllers,
      {rec1: controllerDefinitions.rec1},
      []
    );
  });
});
