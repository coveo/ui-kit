import type {Mock, MockInstance} from 'vitest';
import {getSampleCommerceEngineConfiguration} from '@coveo/headless-src/app/commerce-engine/commerce-engine-configuration.js';
import type {NavigatorContext} from '@coveo/headless-src/app/navigator-context-provider.js';
import {buildMockCommerceState} from '@coveo/headless-src/test/mock-commerce-state.js';
import {buildMockSSRCommerceEngine} from '@coveo/headless-src/test/mock-engine-v2.js';
import {buildMockNavigatorContext} from '@coveo/headless-src/test/mock-navigator-context.js';
import {defineMockRecommendationDefinition} from '../../test/mock-ssr-controller-definitions.js';
import type {SolutionType} from '../types/controller-constants.js';
import type {CommerceControllerDefinitionsMap} from '../types/engine.js';
import type {CommerceHydratedState} from '../types/hydrate-static-state.js';
import * as buildFactory from './build-factory.js';
import {fetchRecommendationStaticStateFactory} from './recommendation-static-state-factory.js';

describe('fetchRecommendationStaticStateFactory', () => {
  let mockNavigatorContext: NavigatorContext;
  let engineSpy: MockInstance;
  let mockControllers = {};
  let mockEngine: ReturnType<typeof buildMockSSRCommerceEngine>;
  let options: ReturnType<typeof getSampleCommerceEngineConfiguration>;
  let controllerDefinitions: {
    rec1: ReturnType<typeof defineMockRecommendationDefinition>;
    rec2: ReturnType<typeof defineMockRecommendationDefinition>;
    rec3: ReturnType<typeof defineMockRecommendationDefinition>;
  };

  const setupMocks = () => {
    mockNavigatorContext = buildMockNavigatorContext();
    mockEngine = buildMockSSRCommerceEngine(buildMockCommerceState());

    options = {
      ...getSampleCommerceEngineConfiguration(),
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
            controllers: mockControllers as CommerceHydratedState<
              CommerceControllerDefinitionsMap,
              T
            >['controllers'],
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
      navigatorContext: mockNavigatorContext,
      recommendations: ['rec1', 'rec2'],
      context: {
        country: 'CA',
        currency: 'USD',
        language: 'en',
        view: {url: 'https://example.com'},
      },
    });

    expect(engineSpy).toHaveBeenCalledWith(controllerDefinitions, options);
  });

  it('should carry the controller props in the static state', async () => {
    const controllerProps = {rec1: {options: {productId: 'some-product'}}};
    const factory = fetchRecommendationStaticStateFactory(
      // @ts-expect-error: do not care about baked-in controller initial state
      controllerDefinitions,
      options
    );

    const staticState = await factory({
      navigatorContext: mockNavigatorContext,
      recommendations: ['rec1', 'rec2'],
      context: {
        country: 'CA',
        currency: 'USD',
        language: 'en',
        view: {url: 'https://example.com'},
      },
      controllers: controllerProps,
    } as unknown as Parameters<typeof factory>[0]);

    expect(staticState.controllerProps).toEqual(controllerProps);
  });
});
