import {Mock, MockInstance} from 'vitest';
import {defineRecommendations} from '../../../controllers/commerce/recommendations/headless-recommendations.ssr.js';
import {buildMockCommerceState} from '../../../test/mock-commerce-state.js';
import {buildMockSSRCommerceEngine} from '../../../test/mock-engine-v2.js';
import {getSampleCommerceEngineConfiguration} from '../../commerce-engine/commerce-engine-configuration.js';
import {
  InferControllersMapFromDefinition,
  SolutionType,
} from '../types/common.js';
import {CommerceControllerDefinitionsMap} from '../types/core-engine.js';
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
      () =>
        <T extends SolutionType>() =>
          Promise.resolve({
            engine: mockEngine,
            controllers: {} as InferControllersMapFromDefinition<
              CommerceControllerDefinitionsMap,
              T
            >,
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
      controllerDefinitions,
      options
    );

    await factory({controllers: {}});

    expect(engineSpy).toHaveBeenCalledWith(controllerDefinitions, options);
  });
});
