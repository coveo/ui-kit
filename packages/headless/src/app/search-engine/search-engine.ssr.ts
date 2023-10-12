/**
 * Utility functions to be used for Server Side Rendering.
 */
import {AnyAction} from '@reduxjs/toolkit';
import {Controller} from '../../controllers/index.js';
import {createWaitForActionMiddleware} from '../../utils/utils.js';
import {
  ControllerDefinitionsMap,
  InferControllerPropsMapFromDefinitions,
} from '../ssr-engine/types/common.js';
import {
  EngineDefinition,
  EngineDefinitionOptions,
} from '../ssr-engine/types/core-engine.js';
import {
  SearchEngine,
  SearchEngineOptions,
  buildSearchEngine,
} from './search-engine.js';
import {SearchAction} from '../../features/analytics/analytics-utils.js';
import {
  buildControllerDefinitions,
  composeFunction,
  createStaticState,
} from '../ssr-engine/common.js';

/**
 * @internal
 */
export interface SSRSearchEngine extends SearchEngine {
  waitForSearchCompletedAction(): Promise<SearchCompletedAction>;
}

/**
 * @internal
 */
export type SearchEngineDefinition<
  TControllers extends ControllerDefinitionsMap<SSRSearchEngine, Controller>,
> = EngineDefinition<SSRSearchEngine, TControllers, SearchEngineOptions>;

/**
 * @internal
 */
export type SearchEngineDefinitionOptions<
  TControllers extends ControllerDefinitionsMap<SSRSearchEngine, Controller>,
> = EngineDefinitionOptions<SearchEngineOptions, TControllers>;

export type SearchCompletedAction = ReturnType<
  SearchAction['fulfilled' | 'rejected']
>;

function isSearchCompletedAction(
  action: AnyAction
): action is SearchCompletedAction {
  return /^search\/executeSearch\/(fulfilled|rejected)$/.test(action.type);
}

function buildSSRSearchEngine(options: SearchEngineOptions): SSRSearchEngine {
  const {middleware, promise} = createWaitForActionMiddleware(
    isSearchCompletedAction
  );
  const searchEngine = buildSearchEngine({
    ...options,
    middlewares: [...(options.middlewares ?? []), middleware],
  });
  return {
    ...searchEngine,
    get state() {
      return searchEngine.state;
    },
    waitForSearchCompletedAction() {
      return promise;
    },
  };
}

/**
 * @internal
 *
 * Initializes a Search engine definition in SSR with given controllers definitions and search engine config.
 * @returns Three utility functions to fetch initial state of engine in SSR, hydrate the state in CSR
 *  and a build function that can be used for edge cases requiring more control.
 */
export function defineSearchEngine<
  TControllerDefinitions extends ControllerDefinitionsMap<
    SearchEngine,
    Controller
  >,
>({
  controllers: controllerDefinitions,
  ...engineOptions
}: SearchEngineDefinitionOptions<TControllerDefinitions>): SearchEngineDefinition<TControllerDefinitions> {
  type Definition = SearchEngineDefinition<TControllerDefinitions>;
  type BuildFunction = Definition['build'];
  type FetchStaticStateFunction = Definition['fetchStaticState'];
  type HydrateStaticStateFunction = Definition['hydrateStaticState'];
  type FetchStaticStateFromBuildResultFunction =
    FetchStaticStateFunction['fromBuildResult'];
  type HydrateStaticStateFromBuildResultFunction =
    HydrateStaticStateFunction['fromBuildResult'];
  type BuildParameters = Parameters<BuildFunction>;
  type FetchStaticStateParameters = Parameters<FetchStaticStateFunction>;
  type HydrateStaticStateParameters = Parameters<HydrateStaticStateFunction>;
  type FetchStaticStateFromBuildResultParameters =
    Parameters<FetchStaticStateFromBuildResultFunction>;
  type HydrateStaticStateFromBuildResultParameters =
    Parameters<HydrateStaticStateFromBuildResultFunction>;

  const build: BuildFunction = async (...[buildOptions]: BuildParameters) => {
    const engine = buildSSRSearchEngine(
      buildOptions?.extend
        ? await buildOptions.extend(engineOptions)
        : engineOptions
    );
    const controllers = buildControllerDefinitions({
      definitionsMap: (controllerDefinitions ?? {}) as TControllerDefinitions,
      engine,
      propsMap: (buildOptions && 'controllers' in buildOptions
        ? buildOptions.controllers
        : {}) as InferControllerPropsMapFromDefinitions<TControllerDefinitions>,
    });
    return {
      engine,
      controllers,
    };
  };

  const fetchStaticState: FetchStaticStateFunction = composeFunction(
    async (...params: FetchStaticStateParameters) => {
      const buildResult = await build(...params);
      const staticState = await fetchStaticState.fromBuildResult({
        buildResult,
      });
      return staticState;
    },
    {
      fromBuildResult: async (
        ...params: FetchStaticStateFromBuildResultParameters
      ) => {
        const [
          {
            buildResult: {engine, controllers},
          },
        ] = params;

        engine.executeFirstSearch();
        return createStaticState({
          searchAction: await engine.waitForSearchCompletedAction(),
          controllers,
        });
      },
    }
  );

  const hydrateStaticState: HydrateStaticStateFunction = composeFunction(
    async (...params: HydrateStaticStateParameters) => {
      const buildResult = await build(...(params as BuildParameters));
      const staticState = await hydrateStaticState.fromBuildResult({
        buildResult,
        searchAction: params[0]!.searchAction,
      });
      return staticState;
    },
    {
      fromBuildResult: async (
        ...params: HydrateStaticStateFromBuildResultParameters
      ) => {
        const [
          {
            buildResult: {engine, controllers},
            searchAction,
          },
        ] = params;
        engine.dispatch(searchAction);
        await engine.waitForSearchCompletedAction();
        return {engine, controllers};
      },
    }
  );

  return {
    build,
    fetchStaticState,
    hydrateStaticState,
  };
}
