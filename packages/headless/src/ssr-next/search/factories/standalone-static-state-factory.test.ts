import type {MockInstance} from 'vitest';
import type {NavigatorContext} from '../../../app/navigator-context-provider.js';
import type {SearchEngineConfiguration} from '../../../app/search-engine/search-engine-configuration.js';
import {buildMockSSRSearchEngine} from '../../../test/mock-engine-v2.js';
import {buildMockNavigatorContext} from '../../../test/mock-navigator-context.js';
import {defineMockSearchController} from '../../../test/mock-ssr-controller-definitions.js';
import {createMockState} from '../../../test/mock-state.js';
import type {BakedInSearchControllers} from '../types/controller-definition.js';
import type {InferControllersMapFromDefinition} from '../types/controller-inference.js';
import type {SearchControllerDefinitionsMap} from '../types/engine.js';
import * as buildFactory from './build-factory.js';
import {fetchStandaloneStaticStateFactory} from './standalone-static-state-factory.js';

vi.mock('../utils/controller-wiring.js');

describe('fetchStandaloneStaticStateFactory', () => {
  let mockNavigatorContext: NavigatorContext;
  let engineSpy: MockInstance;
  const mockEngine = buildMockSSRSearchEngine(createMockState());
  const mockEngineOptions = {
    configuration: {
      organizationId: 'some-org-id',
      accessToken: 'some-token',
      analytics: {
        trackingId: 'xxx',
      },
    } as SearchEngineConfiguration,
  };

  const definition = {
    controller1: defineMockSearchController(),
    controller2: defineMockSearchController(),
  };

  beforeEach(() => {
    mockNavigatorContext = buildMockNavigatorContext();

    engineSpy = vi
      .spyOn(buildFactory, 'buildFactory')
      .mockReturnValue(async () =>
        Promise.resolve({
          engine: mockEngine,
          controllers:
            {} as InferControllersMapFromDefinition<SearchControllerDefinitionsMap> &
              BakedInSearchControllers,
        })
      );

    // Mock engine methods
    mockEngine.executeFirstSearch = vi.fn();
    mockEngine.waitForSearchCompletedAction = vi.fn().mockResolvedValue({
      type: 'search/executeSearch/fulfilled',
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should call buildFactory with the correct parameters', async () => {
    // @ts-expect-error: do not care about baked-in controller initial state
    const factory = fetchStandaloneStaticStateFactory(
      definition,
      mockEngineOptions
    );
    await factory({
      navigatorContext: mockNavigatorContext,
      searchParams: {q: 'test'},
    });
    expect(engineSpy.mock.calls[0][0]).toStrictEqual(definition);
    expect(engineSpy.mock.calls[0][1]).toStrictEqual(mockEngineOptions);
  });

  it('should return the navigator context and search params', async () => {
    // @ts-expect-error: do not care about baked-in controller initial state
    const factory = fetchStandaloneStaticStateFactory(
      definition,
      mockEngineOptions
    );
    const result = await factory({
      navigatorContext: mockNavigatorContext,
      searchParams: {q: 'test'},
    });
    expect(result.navigatorContext).toBe(mockNavigatorContext);
    expect(result.searchParams).toEqual({q: 'test'});
  });

  it('should NOT execute a search', async () => {
    // @ts-expect-error: do not care about baked-in controller initial state
    const factory = fetchStandaloneStaticStateFactory(
      definition,
      mockEngineOptions
    );
    await factory({
      navigatorContext: mockNavigatorContext,
      searchParams: {q: 'test'},
    });

    expect(mockEngine.executeFirstSearch).not.toHaveBeenCalled();
  });

  it('should NOT wait for search completion', async () => {
    // @ts-expect-error: do not care about baked-in controller initial state
    const factory = fetchStandaloneStaticStateFactory(
      definition,
      mockEngineOptions
    );
    await factory({
      navigatorContext: mockNavigatorContext,
      searchParams: {q: 'test'},
    });

    expect(mockEngine.waitForSearchCompletedAction).not.toHaveBeenCalled();
  });

  it('should return an empty searchActions array', async () => {
    // @ts-expect-error: do not care about baked-in controller initial state
    const factory = fetchStandaloneStaticStateFactory(
      definition,
      mockEngineOptions
    );
    const result = await factory({
      navigatorContext: mockNavigatorContext,
      searchParams: {q: 'test'},
    });

    expect(result.searchActions).toEqual([]);
  });

  it('should return controllers from buildFactory', async () => {
    // @ts-expect-error: do not care about baked-in controller initial state
    const factory = fetchStandaloneStaticStateFactory(
      definition,
      mockEngineOptions
    );
    const result = await factory({
      navigatorContext: mockNavigatorContext,
      searchParams: {q: 'test'},
    });

    expect(result.controllers).toBeDefined();
  });

  it('should work without searchParams', async () => {
    // @ts-expect-error: do not care about baked-in controller initial state
    const factory = fetchStandaloneStaticStateFactory(
      definition,
      mockEngineOptions
    );
    const result = await factory({
      navigatorContext: mockNavigatorContext,
    });

    expect(result.navigatorContext).toBe(mockNavigatorContext);
    expect(result.searchActions).toEqual([]);
    expect(mockEngine.executeFirstSearch).not.toHaveBeenCalled();
  });
});
