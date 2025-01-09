import {describe, it, expect, vi} from 'vitest';
import {defineRecommendations} from '../../../controllers/commerce/recommendations/headless-recommendations.ssr.js';
import {getSampleCommerceEngineConfiguration} from '../../commerce-engine/commerce-engine-configuration.js';
import {SolutionType} from '../types/common.js';
import {buildFactory} from './build-factory.js';
import {hydratedRecommendationStaticStateFactory} from './recommendation-hydrated-state-factory.js';

vi.mock('./build-factory.js');

describe('hydratedRecommendationStaticStateFactory', () => {
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
  const mockBuildResult = {
    engine: {
      dispatch: vi.fn(),
      waitForRequestCompletedAction: vi
        .fn()
        .mockResolvedValue([{type: 'some-action'}]),
    },
    controllers: {},
  };
  const mockSearchActions = [{type: 'some-search-action'}];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call buildFactory with correct parameters', async () => {
    const mockSolutionTypeBuild = vi.fn().mockResolvedValue(mockBuildResult);
    const controllerDefinitions = createControllerDefinitions();
    const options = createEngineOptions();
    const mockRecommendationState = vi
      .fn()
      .mockImplementation(() => mockSolutionTypeBuild);
    vi.mocked(buildFactory).mockReturnValue(mockRecommendationState);

    const factory = hydratedRecommendationStaticStateFactory(
      controllerDefinitions,
      options
    );

    await factory({searchActions: mockSearchActions, controllers: {}});

    expect(buildFactory).toHaveBeenCalledWith(controllerDefinitions, options);
    expect(mockRecommendationState).toHaveBeenCalledWith(
      SolutionType.recommendation
    );
  });

  it('should dispatch search actions and wait for request completion', async () => {
    const mockSolutionTypeBuild = vi.fn().mockResolvedValue(mockBuildResult);
    vi.mocked(buildFactory).mockReturnValue(() => mockSolutionTypeBuild);

    const factory = hydratedRecommendationStaticStateFactory(
      createControllerDefinitions(),
      createEngineOptions()
    );

    const staticState = await factory({
      searchActions: mockSearchActions,
      controllers: {},
    });

    expect(mockBuildResult.engine.dispatch).toHaveBeenCalledWith(
      mockSearchActions[0]
    );
    expect(
      mockBuildResult.engine.waitForRequestCompletedAction
    ).toHaveBeenCalledOnce();
    expect(staticState).toEqual(mockBuildResult);
  });

  it('should call fromBuildResult with correct parameters', async () => {
    const mockSolutionTypeBuild = vi.fn().mockResolvedValue(mockBuildResult);
    vi.mocked(buildFactory).mockReturnValue(() => mockSolutionTypeBuild);

    const factory = hydratedRecommendationStaticStateFactory(
      createControllerDefinitions(),
      createEngineOptions()
    );

    const staticState = await factory({
      searchActions: mockSearchActions,
      controllers: {},
    });

    expect(staticState).toEqual(mockBuildResult);
  });
});
