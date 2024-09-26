/**
 * Utility functions to be used for Server Side Rendering.
 */
import {UnknownAction} from '@reduxjs/toolkit';
import type {Controller} from '../../controllers/controller/headless-controller.js';
import {LegacySearchAction} from '../../features/analytics/analytics-utils.js';
import {createWaitForActionMiddleware} from '../../utils/utils.js';
import {NavigatorContextProvider} from '../navigatorContextProvider.js';
import {
  buildControllerDefinitions,
  composeFunction,
  createStaticState,
} from '../ssr-engine/common.js';
import {
  ControllerDefinitionsMap,
  EngineStaticState,
  InferControllerPropsMapFromDefinitions,
  InferControllerStaticStateMapFromDefinitions,
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

/**
 * The SSR search engine.
 */
export interface SSRSearchEngine extends SearchEngine {
  /**
   * Waits for the search to be completed and returns a promise that resolves to a `SearchCompletedAction`.
   */
  waitForSearchCompletedAction(): Promise<SearchCompletedAction>;
}

export type SearchEngineDefinitionOptions<
  TControllers extends ControllerDefinitionsMap<SSRSearchEngine, Controller>,
> = EngineDefinitionOptions<SearchEngineOptions, TControllers>;

export type SearchCompletedAction = ReturnType<
  LegacySearchAction['fulfilled' | 'rejected']
>;

function isSearchCompletedAction(
  action: unknown
): action is SearchCompletedAction {
  return /^search\/executeSearch\/(fulfilled|rejected)$/.test(
    (action as UnknownAction).type
  );
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

export interface SearchEngineDefinition<
  TControllers extends ControllerDefinitionsMap<SSRSearchEngine, Controller>,
> extends EngineDefinition<
    SSRSearchEngine,
    TControllers,
    SearchEngineOptions
  > {}

/**
 * Initializes a Search engine definition in SSR with given controllers definitions and search engine config.
 * @param options - The search engine definition
 * @returns Three utility functions to fetch the initial state of the engine in SSR, hydrate the state in CSR,
 *  and a build function that can be used for edge cases requiring more control.
 */
export function defineSearchEngine<
  TControllerDefinitions extends ControllerDefinitionsMap<
    SearchEngine,
    Controller
  >,
>(
  options: SearchEngineDefinitionOptions<TControllerDefinitions>
): SearchEngineDefinition<TControllerDefinitions> {
  const {controllers: controllerDefinitions, ...engineOptions} = options;
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

  const getOptions = () => {
    return engineOptions;
  };

  const setNavigatorContextProvider = (
    navigatorContextProvider: NavigatorContextProvider
  ) => {
    engineOptions.navigatorContextProvider = navigatorContextProvider;
  };

  const build: BuildFunction = async (...[buildOptions]: BuildParameters) => {
    const engine = buildSSRSearchEngine(
      buildOptions?.extend
        ? await buildOptions.extend(getOptions())
        : getOptions()
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
      if (!getOptions().navigatorContextProvider) {
        // TODO: KIT-3409 - implement a logger to log SSR warnings/errors
        console.warn(
          '[WARNING] Missing navigator context in server-side code. Make sure to set it with `setNavigatorContextProvider` before calling fetchStaticState()'
        );
      }
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
        }) as EngineStaticState<
          UnknownAction,
          InferControllerStaticStateMapFromDefinitions<TControllerDefinitions>
        >;
      },
    }
  );

  const hydrateStaticState: HydrateStaticStateFunction = composeFunction(
    async (...params: HydrateStaticStateParameters) => {
      if (!getOptions().navigatorContextProvider) {
        // TODO: KIT-3409 - implement a logger to log SSR warnings/errors
        console.warn(
          '[WARNING] Missing navigator context in client-side code. Make sure to set it with `setNavigatorContextProvider` before calling hydrateStaticState()'
        );
      }
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
    setNavigatorContextProvider,
  };
}
