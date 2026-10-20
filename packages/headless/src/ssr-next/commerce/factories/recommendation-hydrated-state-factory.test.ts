import {describe, expect, it, vi} from 'vitest';
import {getSampleCommerceEngineConfiguration} from '../../../app/commerce-engine/commerce-engine-configuration.js';
import {defineCart} from '../controllers/cart/headless-cart.ssr.js';
import {defineContext} from '../controllers/context/headless-context.ssr.js';
import {defineParameterManager} from '../controllers/parameter-manager/headless-core-parameter-manager.ssr.js';
import {defineRecommendations} from '../controllers/recommendations/headless-recommendations.ssr.js';
import {SolutionType} from '../types/controller-constants.js';
import {buildFactory} from './build-factory.js';
import {hydratedRecommendationStaticStateFactory} from './recommendation-hydrated-state-factory.js';

vi.mock('./build-factory.js');

describe('hydratedRecommendationStaticStateFactory', () => {
  const createEngineOptions = () => ({
    configuration: getSampleCommerceEngineConfiguration(),
  });

  const bakedInControllers = {
    parameterManager: defineParameterManager(),
    context: defineContext(),
    cart: defineCart(),
  };

  const createControllerDefinitions = () => ({
    ...bakedInControllers,
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
        .mockReturnValue([Promise.resolve({type: 'some-action'})]),
    },
    controllers: {},
  };

  const flushMicrotasks = () => new Promise((resolve) => setTimeout(resolve, 0));

  beforeEach(() => {
    vi.clearAllMocks();
    mockBuildResult.engine.waitForRequestCompletedAction.mockReturnValue([
      Promise.resolve({type: 'some-action'}),
    ]);
  });

  it('should call buildFactory with correct parameters', async () => {
    const mockSolutionTypeBuild = vi.fn().mockResolvedValue(mockBuildResult);
    const controllerDefinitions = createControllerDefinitions();
    const options = createEngineOptions();
    const mockRecommendationState = vi.fn().mockImplementation(() => mockSolutionTypeBuild);
    vi.mocked(buildFactory).mockReturnValue(mockRecommendationState);

    const factory = hydratedRecommendationStaticStateFactory(controllerDefinitions, options);

    // @ts-expect-error: do not care about hydration props here
    await factory({});

    expect(buildFactory).toHaveBeenCalledWith(controllerDefinitions, options);
    expect(mockRecommendationState).toHaveBeenCalledWith(SolutionType.recommendation);
  });

  it('should wait for request completion', async () => {
    const mockSolutionTypeBuild = vi.fn().mockResolvedValue(mockBuildResult);
    vi.mocked(buildFactory).mockReturnValue(() => mockSolutionTypeBuild);

    const factory = hydratedRecommendationStaticStateFactory(
      createControllerDefinitions(),
      createEngineOptions()
    );

    // @ts-expect-error: do not care about hydration props here
    const staticState = await factory({});

    expect(mockBuildResult.engine.waitForRequestCompletedAction).toHaveBeenCalledOnce();
    expect(staticState).toEqual(mockBuildResult);
  });

  it('should resolve only once every replayed recommendation request has completed', async () => {
    let completeFirstRequest: (action: {type: string}) => void = () => {};
    const firstRequest = new Promise<{type: string}>((resolve) => {
      completeFirstRequest = resolve;
    });
    mockBuildResult.engine.waitForRequestCompletedAction.mockReturnValue([
      firstRequest,
      Promise.resolve({type: 'second-action'}),
    ]);
    const mockSolutionTypeBuild = vi.fn().mockResolvedValue(mockBuildResult);
    vi.mocked(buildFactory).mockReturnValue(() => mockSolutionTypeBuild);

    const factory = hydratedRecommendationStaticStateFactory(
      createControllerDefinitions(),
      createEngineOptions()
    );

    let settled = false;
    // @ts-expect-error: do not care about hydration props here
    const hydration = factory({}).then(() => {
      settled = true;
    });
    await flushMicrotasks();

    expect(settled).toBe(false);

    completeFirstRequest({type: 'first-action'});
    await hydration;

    expect(settled).toBe(true);
  });
});
