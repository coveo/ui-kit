import {beforeEach, describe, expect, it, vi} from 'vitest';
import {getSampleSearchEngineConfiguration} from '../../../app/search-engine/search-engine-configuration.js';
import {buildMockNavigatorContext} from '../../../test/mock-navigator-context.js';
import {defineMockSearchControllerWithProps} from '../../../test/mock-ssr-controller-definitions.js';
import {defineSearchParameterManager} from '../controllers/search-parameter-manager/headless-search-parameter-manager.ssr.js';
import type {FetchStaticStateParameters} from '../types/engine.js';
import {buildFactory} from './build-factory.js';
import {fetchStaticStateFactory} from './static-state-factory.js';

vi.mock('./build-factory.js');

describe('fetchStaticStateFactory', () => {
  const controllerDefinitions = {
    parameterManager: defineSearchParameterManager(),
    customController: defineMockSearchControllerWithProps(),
  };
  const options = {configuration: getSampleSearchEngineConfiguration()};
  const searchAction = {type: 'search/executeSearch/fulfilled'};
  const controllerProps = {customController: {initialState: {foo: 'bar'}}};

  const engine = {
    executeFirstSearch: vi.fn(),
    waitForSearchCompletedAction: vi.fn(),
  };
  const controllers = {
    customController: {state: {foo: 'bar'}, subscribe: vi.fn()},
    parameterManager: {state: {parameters: {}}, subscribe: vi.fn()},
  };

  const fetchStaticState = () =>
    fetchStaticStateFactory(
      controllerDefinitions,
      options
    )({
      navigatorContext: buildMockNavigatorContext(),
      searchParams: {q: 'test'},
      controllers: controllerProps,
    } as unknown as FetchStaticStateParameters<typeof controllerDefinitions>);

  beforeEach(() => {
    vi.clearAllMocks();
    engine.waitForSearchCompletedAction.mockResolvedValue(searchAction);
    vi.mocked(buildFactory).mockReturnValue(
      vi.fn().mockResolvedValue({engine, controllers}) as unknown as ReturnType<typeof buildFactory>
    );
  });

  it('should execute the first search and wait for it to complete', async () => {
    const staticState = await fetchStaticState();

    expect(engine.executeFirstSearch).toHaveBeenCalledOnce();
    expect(staticState.searchActions).toEqual([searchAction]);
  });

  it('should return the state of every controller, including the baked-in parameter manager', async () => {
    const staticState = await fetchStaticState();

    expect(staticState.controllers.customController).toEqual({state: {foo: 'bar'}});
    expect(staticState.controllers.parameterManager).toEqual({state: {parameters: {}}});
  });

  it('should carry the controller props separately from the controller states', async () => {
    const staticState = await fetchStaticState();

    expect(staticState.controllerProps).toEqual(controllerProps);
    expect(staticState).not.toHaveProperty('controllers.customController.initialState.foo');
  });

  it('should echo the build configuration so the static state can be hydrated as is', async () => {
    const staticState = await fetchStaticState();

    expect(staticState.navigatorContext).toEqual(buildMockNavigatorContext());
    expect(staticState.searchParams).toEqual({q: 'test'});
  });
});
