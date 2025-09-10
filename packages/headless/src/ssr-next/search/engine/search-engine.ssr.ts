/**
 * Utility functions to be used for Server Side Rendering.
 */
import type {UnknownAction} from '@reduxjs/toolkit';
import {buildLogger} from '../../../app/logger.js';
import type {NavigatorContextProvider} from '../../../app/navigator-context-provider.js';
import {
  buildSearchEngine,
  type SearchEngine,
  type SearchEngineOptions,
} from '../../../app/search-engine/search-engine.js';
import type {Controller} from '../../../controllers/controller/headless-controller.js';
import type {LegacySearchAction} from '../../../features/analytics/analytics-utils.js';
import {createWaitForActionMiddleware} from '../../../utils/utils.js';
import {augmentPreprocessRequestWithForwardedFor} from '../../common/augment-preprocess-request.js';
import type {EngineStaticState} from '../../common/types/engine.js';
import {
  buildControllerDefinitions,
  createStaticState,
} from '../controller-utils.js';
import type {BuildParameters} from '../types/build.js';
import type {ControllerDefinitionsMap} from '../types/controller-definition.js';
import type {
  InferControllerPropsMapFromDefinitions,
  InferControllerStaticStateMapFromDefinitions,
} from '../types/controller-inference.js';
import type {
  EngineBuildResult,
  SearchEngineDefinition,
  SearchEngineDefinitionOptions,
} from '../types/engine.js';
import type {FetchStaticStateParameters} from '../types/fetch-static-state.js';
import type {HydrateStaticStateParameters} from '../types/hydrate-static-state.js';

/**
 * The SSR search engine.
 *
 * @group Engine
 */
export interface SSRSearchEngine extends SearchEngine {
  /**
   * Waits for the search to be completed and returns a promise that resolves to a `SearchCompletedAction`.
   */
  waitForSearchCompletedAction(): Promise<SearchCompletedAction>;
}

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

/**
 * Initializes a Search engine definition in SSR with given controllers definitions and search engine config.
 *
 * @param options - The search engine definition
 * @returns Three utility functions to fetch the initial state of the engine in SSR, hydrate the state in CSR,
 *  and a build function that can be used for edge cases requiring more control.
 *
 * @group Engine
 */
export function defineSearchEngine<
  TControllerDefinitions extends ControllerDefinitionsMap<
    SearchEngine,
    Controller
  >,
>(options: SearchEngineDefinitionOptions<TControllerDefinitions>) {
  const {controllers: controllerDefinitions, ...engineOptions} = options;
  type BuildFunction = EngineBuildResult<
    SSRSearchEngine,
    TControllerDefinitions
  >;
  type Definition = SearchEngineDefinition<
    SSRSearchEngine,
    TControllerDefinitions
  >;
  type FetchStaticStateFunction = Definition['fetchStaticState'];
  type HydrateStaticStateFunction = Definition['hydrateStaticState'];

  type FetchParams = FetchStaticStateParameters<
    InferControllerPropsMapFromDefinitions<TControllerDefinitions>
  >;
  type BuildParams = BuildParameters<
    InferControllerPropsMapFromDefinitions<TControllerDefinitions>
  >;
  type HydrateParams = HydrateStaticStateParameters<
    UnknownAction,
    InferControllerPropsMapFromDefinitions<TControllerDefinitions>
  >;

  const getOptions = () => {
    return engineOptions;
  };

  const setNavigatorContextProvider = (
    navigatorContextProvider: NavigatorContextProvider
  ) => {
    engineOptions.navigatorContextProvider = navigatorContextProvider;
  };

  const build: BuildFunction = async (
    buildOptions: BuildParameters<
      InferControllerPropsMapFromDefinitions<TControllerDefinitions>
    >
  ) => {
    const logger = buildLogger(options.loggerOptions);
    if (!getOptions().navigatorContextProvider) {
      logger.warn(
        '[WARNING] Missing navigator context in server-side code. Make sure to set it with `setNavigatorContextProvider` before calling fetchStaticState()'
      );
    }
    const engine = buildSSRSearchEngine(getOptions());
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

  const fetchStaticState: FetchStaticStateFunction = async (
    params: FetchParams
  ) => {
    const {engine, controllers} = await build(params as BuildParams);

    options.configuration.preprocessRequest =
      augmentPreprocessRequestWithForwardedFor({
        preprocessRequest: options.configuration.preprocessRequest,
        navigatorContextProvider: options.navigatorContextProvider,
        loggerOptions: options.loggerOptions,
      });

    engine.executeFirstSearch();
    const staticState = createStaticState({
      searchAction: await engine.waitForSearchCompletedAction(),
      controllers: controllers,
    }) as EngineStaticState<
      UnknownAction,
      InferControllerStaticStateMapFromDefinitions<TControllerDefinitions>
    >;

    return staticState;
  };

  const hydrateStaticState: HydrateStaticStateFunction = async (
    params: HydrateParams
  ) => {
    const {engine, controllers} = await build(params as BuildParams);
    params.searchActions.forEach((action) => {
      engine.dispatch(action);
    });
    await engine.waitForSearchCompletedAction();
    return {engine, controllers};
  };

  return {
    fetchStaticState,
    hydrateStaticState,
    setNavigatorContextProvider,
  };
}
