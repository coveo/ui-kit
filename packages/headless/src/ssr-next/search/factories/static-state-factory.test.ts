import {beforeEach, describe, expect, it, vi} from 'vitest';
import {getSampleSearchEngineConfiguration} from '../../../app/search-engine/search-engine-configuration.js';
import {buildMockNavigatorContext} from '../../../test/mock-navigator-context.js';
import {defineMockSearchControllerReadingPageFacts} from '../../../test/mock-ssr-controller-definitions.js';
import {defineContext} from '../controllers/context/headless-context.ssr.js';
import {defineSearchParameterManager} from '../controllers/search-parameter-manager/headless-search-parameter-manager.ssr.js';
import type {FetchStaticStateParameters} from '../types/engine.js';
import {buildFactory} from './build-factory.js';
import {fetchStaticStateFactory} from './static-state-factory.js';

vi.mock('./build-factory.js');

describe('fetchStaticStateFactory', () => {
  const controllerDefinitions = {
    parameterManager: defineSearchParameterManager(),
    context: defineContext(),
    customController: defineMockSearchControllerReadingPageFacts(),
  };
  const options = {configuration: getSampleSearchEngineConfiguration()};
  const searchAction = {type: 'search/executeSearch/fulfilled'};
  const pageFacts: FetchStaticStateParameters<typeof controllerDefinitions> = {
    navigatorContext: buildMockNavigatorContext(),
    searchParams: {q: 'test'},
    context: {ageGroup: '30-45'},
  };

  const engine = {
    executeFirstSearch: vi.fn(),
    waitForSearchCompletedAction: vi.fn(),
  };
  const controllers = {
    customController: {state: {foo: 'bar'}, subscribe: vi.fn()},
    parameterManager: {state: {parameters: {q: 'test'}}, subscribe: vi.fn()},
    context: {state: {values: {ageGroup: '30-45'}}, subscribe: vi.fn()},
  };
  let build: ReturnType<typeof vi.fn>;

  const fetchStaticState = () => fetchStaticStateFactory(controllerDefinitions, options)(pageFacts);

  beforeEach(() => {
    vi.clearAllMocks();
    engine.waitForSearchCompletedAction.mockResolvedValue(searchAction);
    build = vi.fn().mockResolvedValue({engine, controllers});
    vi.mocked(buildFactory).mockReturnValue(build as unknown as ReturnType<typeof buildFactory>);
  });

  it('should build the engine and the controllers with the page facts', async () => {
    await fetchStaticState();

    expect(buildFactory).toHaveBeenCalledWith(controllerDefinitions, options);
    expect(build).toHaveBeenCalledExactlyOnceWith(pageFacts);
  });

  it('should execute the first search and wait for it to complete', async () => {
    const staticState = await fetchStaticState();

    expect(engine.executeFirstSearch).toHaveBeenCalledOnce();
    expect(staticState.searchActions).toEqual([searchAction]);
  });

  it('should return the state of every controller, including the baked-in parameter manager and context', async () => {
    const staticState = await fetchStaticState();

    expect(staticState.controllers.customController).toEqual({state: {foo: 'bar'}});
    expect(staticState.controllers.parameterManager).toEqual({state: {parameters: {q: 'test'}}});
    expect(staticState.controllers.context).toEqual({state: {values: {ageGroup: '30-45'}}});
  });

  it('should carry the page facts alongside the controller states and the search actions, and nothing else', async () => {
    const staticState = await fetchStaticState();

    expect(staticState).toEqual({
      ...pageFacts,
      searchActions: [searchAction],
      controllers: expect.any(Object),
    });
    expect(staticState).not.toHaveProperty('controllerProps');
  });
});
