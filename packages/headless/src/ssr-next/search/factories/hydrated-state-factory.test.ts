import {beforeEach, describe, expect, it, vi} from 'vitest';
import {getSampleSearchEngineConfiguration} from '../../../app/search-engine/search-engine-configuration.js';
import {buildMockNavigatorContext} from '../../../test/mock-navigator-context.js';
import {defineSearchParameterManager} from '../controllers/search-parameter-manager/headless-search-parameter-manager.ssr.js';
import type {SearchCompletedAction} from '../types/build.js';
import type {HydrateStaticStateParameters} from '../types/engine.js';
import {buildFactory} from './build-factory.js';
import {hydratedStaticStateFactory} from './hydrated-state-factory.js';

vi.mock('./build-factory.js');

describe('hydratedStaticStateFactory', () => {
  const controllerDefinitions = {parameterManager: defineSearchParameterManager()};
  const options = {configuration: getSampleSearchEngineConfiguration()};
  const searchActions = [
    {type: 'search/executeSearch/fulfilled'},
    {type: 'search/executeSearch/fulfilled'},
  ] as unknown as SearchCompletedAction[];

  let engine: {
    dispatch: ReturnType<typeof vi.fn>;
    waitForSearchCompletedAction: ReturnType<typeof vi.fn>;
  };
  let build: ReturnType<typeof vi.fn>;

  const staticStateWith = (actions: SearchCompletedAction[]) =>
    ({
      navigatorContext: buildMockNavigatorContext(),
      searchParams: {q: 'test'},
      context: {ageGroup: '30-45'},
      searchActions: actions,
      controllers: {},
    }) as unknown as HydrateStaticStateParameters<typeof controllerDefinitions>;

  const hydrate = (actions: SearchCompletedAction[]) =>
    hydratedStaticStateFactory(controllerDefinitions, options)(staticStateWith(actions));

  beforeEach(() => {
    vi.clearAllMocks();
    engine = {
      dispatch: vi.fn(),
      waitForSearchCompletedAction: vi.fn().mockResolvedValue(searchActions[0]),
    };
    build = vi.fn().mockResolvedValue({engine, controllers: {}});
    vi.mocked(buildFactory).mockReturnValue(build as unknown as ReturnType<typeof buildFactory>);
  });

  it('should hand the static state to buildFactory as is, page facts included', async () => {
    const staticState = staticStateWith(searchActions);

    await hydratedStaticStateFactory(controllerDefinitions, options)(staticState);

    expect(buildFactory).toHaveBeenCalledWith(controllerDefinitions, options);
    expect(build).toHaveBeenCalledExactlyOnceWith(staticState);
  });

  it('should leave the replay of the search actions to buildFactory instead of dispatching them again', async () => {
    await hydrate(searchActions);

    expect(engine.dispatch).not.toHaveBeenCalled();
  });

  it('should wait for the replayed search to complete when there are search actions', async () => {
    await hydrate(searchActions);

    expect(engine.waitForSearchCompletedAction).toHaveBeenCalledOnce();
  });

  it('should not wait for a search when there are no search actions', async () => {
    await hydrate([]);

    expect(engine.waitForSearchCompletedAction).not.toHaveBeenCalled();
  });

  it('should return the engine and the controllers built by buildFactory', async () => {
    const hydratedState = await hydrate(searchActions);

    expect(hydratedState).toEqual({engine, controllers: {}});
  });
});
