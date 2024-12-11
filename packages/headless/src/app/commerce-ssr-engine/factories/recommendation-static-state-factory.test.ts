import {Mock} from 'vitest';
import {defineRecommendations} from '../../../controllers/commerce/recommendations/headless-recommendations.ssr.js';
import {getSampleCommerceEngineConfiguration} from '../../commerce-engine/commerce-engine-configuration.js';
import {buildLogger} from '../../logger.js';
import {CommerceControllerDefinitionsMap} from '../types/core-engine.js';
import type {CommerceEngineDefinitionOptions} from './build-factory.js';
import * as buildFactory from './build-factory.js';
import {fetchRecommendationStaticStateFactory} from './recommendation-static-state-factory.js';

vi.mock('../../logger.js');

describe('fetchRecommendationStaticStateFactory', () => {
  const mockLogger = {
    warn: vi.fn(),
    debug: vi.fn(),
  };

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
    (buildLogger as Mock).mockReturnValue(mockLogger);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should log a warning if navigatorContextProvider is not set', async () => {
    const controllerDefinitions: CommerceControllerDefinitionsMap = {};
    const options: CommerceEngineDefinitionOptions<CommerceControllerDefinitionsMap> =
      {configuration: getSampleCommerceEngineConfiguration()};

    const factory = fetchRecommendationStaticStateFactory(
      controllerDefinitions,
      options
    );

    await factory();

    expect(mockLogger.warn).toHaveBeenCalledTimes(1);
    expect(mockLogger.warn).toHaveBeenCalledWith(
      expect.stringContaining('Missing navigator context in server-side code')
    );
  });

  it('should not log a warning if navigatorContextProvider is set', async () => {
    const controllerDefinitions: CommerceControllerDefinitionsMap = {};
    const options: CommerceEngineDefinitionOptions<CommerceControllerDefinitionsMap> =
      {
        configuration: getSampleCommerceEngineConfiguration(),
        navigatorContextProvider: vi.fn(),
      };

    const factory = fetchRecommendationStaticStateFactory(
      controllerDefinitions,
      options
    );

    await factory();

    expect(mockLogger.warn).toHaveBeenCalledTimes(0);
  });

  it('should call buildFactory with the correct parameters', async () => {
    const spy = vi.spyOn(buildFactory, 'buildFactory');
    const controllerDefinitions = createControllerDefinitions();
    const options = createEngineOptions();

    const factory = fetchRecommendationStaticStateFactory(
      controllerDefinitions,
      options
    );

    await factory({controllers: {}});

    expect(spy).toHaveBeenCalledWith(controllerDefinitions, options);
  });

  it('should return static state from build result', async () => {
    const controllerDefinitions = createControllerDefinitions();
    const options = createEngineOptions();

    const factory = fetchRecommendationStaticStateFactory(
      controllerDefinitions,
      options
    );

    const {controllers} = await factory({
      controllers: {},
    });

    expect(Object.keys(controllers)).toHaveLength(2);
    expect(controllers.popularBought).toHaveProperty('state');
    expect(controllers.popularViewed).toHaveProperty('state');
  });
});
