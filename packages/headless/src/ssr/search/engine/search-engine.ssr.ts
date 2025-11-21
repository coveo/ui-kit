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
import {loadConfigurationActions} from '../../../features/configuration/configuration-actions-loader.js';
import {createWaitForActionMiddleware} from '../../../utils/utils.js';
import {createAccessTokenManager} from '../../common/access-token-manager.js';
import {augmentPreprocessRequestWithForwardedFor} from '../../common/augment-preprocess-request.js';
import {
  buildControllerDefinitions,
  composeFunction,
  createStaticState,
} from '../../common/controller-utils.js';
import type {ControllerDefinitionsMap} from '../../common/types/controllers.js';
import type {
  EngineDefinition,
  EngineDefinitionOptions,
  EngineStaticState,
} from '../../common/types/engine.js';
import type {
  InferControllerPropsMapFromDefinitions,
  InferControllerStaticStateMapFromDefinitions,
} from '../../common/types/inference.js';

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

/**
 * The options to create a search engine definition in SSR.
 *
 * @group Engine
 */
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

  const tokenManager = createAccessTokenManager(
    engineOptions.configuration.accessToken
  );

  const getOptions = () => {
    return engineOptions;
  };

  const setNavigatorContextProvider = (
    navigatorContextProvider: NavigatorContextProvider
  ) => {
    engineOptions.navigatorContextProvider = navigatorContextProvider;
  };

  const getAccessToken = () => tokenManager.getAccessToken();

  const setAccessToken = (accessToken: string) => {
    engineOptions.configuration.accessToken = accessToken;
    tokenManager.setAccessToken(accessToken);
  };

  const build: BuildFunction = async (...[buildOptions]: BuildParameters) => {
    const logger = buildLogger(options.loggerOptions);
    if (!getOptions().navigatorContextProvider) {
      logger.warn(
        '[WARNING] Missing navigator context in server-side code. Make sure to set it with `setNavigatorContextProvider` before calling fetchStaticState()'
      );
    }
    const engine = buildSSRSearchEngine(
      buildOptions?.extend
        ? await buildOptions.extend(getOptions())
        : getOptions()
    );

    const updateEngineConfiguration = (accessToken: string) => {
      const {updateBasicConfiguration} = loadConfigurationActions(engine);
      engine.dispatch(
        updateBasicConfiguration({
          accessToken,
        })
      );
    };

    tokenManager.registerCallback(updateEngineConfiguration);

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
      engineOptions.configuration.preprocessRequest =
        augmentPreprocessRequestWithForwardedFor({
          preprocessRequest: engineOptions.configuration.preprocessRequest,
          navigatorContextProvider: engineOptions.navigatorContextProvider,
          loggerOptions: engineOptions.loggerOptions,
        });

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
    getAccessToken,
    setAccessToken,
  };
}
