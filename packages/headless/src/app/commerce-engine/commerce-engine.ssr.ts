/**
 * Utility functions to be used for Commerce Server Side Rendering.
 */
import {Action, UnknownAction} from '@reduxjs/toolkit';
import {stateKey} from '../../app/state-key.js';
import {buildProductListing} from '../../controllers/commerce/product-listing/headless-product-listing.js';
import {buildSearch} from '../../controllers/commerce/search/headless-search.js';
import type {Controller} from '../../controllers/controller/headless-controller.js';
import {createWaitForActionMiddleware} from '../../utils/utils.js';
import {buildControllerDefinitions} from '../commerce-ssr-engine/common.js';
import {
  ControllerDefinitionsMap,
  InferControllerStaticStateMapFromDefinitionsWithSolutionType,
  SolutionType,
} from '../commerce-ssr-engine/types/common.js';
import {
  EngineDefinition,
  EngineDefinitionOptions,
} from '../commerce-ssr-engine/types/core-engine.js';
import {NavigatorContextProvider} from '../navigatorContextProvider.js';
import {composeFunction} from '../ssr-engine/common.js';
import {createStaticState} from '../ssr-engine/common.js';
import {
  EngineStaticState,
  InferControllerPropsMapFromDefinitions,
} from '../ssr-engine/types/common.js';
import {
  CommerceEngine,
  CommerceEngineOptions,
  buildCommerceEngine,
} from './commerce-engine.js';

/**
 * The SSR commerce engine.
 */
export interface SSRCommerceEngine extends CommerceEngine {
  /**
   * Waits for the search to be completed and returns a promise that resolves to a `SearchCompletedAction`.
   */
  waitForRequestCompletedAction(): Promise<Action>;
}

export type CommerceEngineDefinitionOptions<
  TControllers extends ControllerDefinitionsMap<SSRCommerceEngine, Controller>,
> = EngineDefinitionOptions<CommerceEngineOptions, TControllers>;

function isListingFetchCompletedAction(action: unknown): action is Action {
  return /^commerce\/productListing\/fetch\/(fulfilled|rejected)$/.test(
    (action as UnknownAction).type
  );
}

function isSearchCompletedAction(action: unknown): action is Action {
  return /^commerce\/search\/executeSearch\/(fulfilled|rejected)$/.test(
    (action as UnknownAction).type
  );
}

function noSearchActionRequired(_action: unknown): _action is Action {
  return true;
}

function buildSSRCommerceEngine(
  solutionType: SolutionType,
  options: CommerceEngineOptions
): SSRCommerceEngine {
  let actionCompletionMiddleware: ReturnType<
    typeof createWaitForActionMiddleware
  >;

  switch (solutionType) {
    case SolutionType.listing:
      actionCompletionMiddleware = createWaitForActionMiddleware(
        isListingFetchCompletedAction
      );
      break;
    case SolutionType.search:
      actionCompletionMiddleware = createWaitForActionMiddleware(
        isSearchCompletedAction
      );
      break;
    default:
      actionCompletionMiddleware = createWaitForActionMiddleware(
        noSearchActionRequired
      );
  }

  const commerceEngine = buildCommerceEngine({
    ...options,
    middlewares: [
      ...(options.middlewares ?? []),
      actionCompletionMiddleware.middleware,
    ],
  });

  return {
    ...commerceEngine,

    get [stateKey]() {
      return commerceEngine[stateKey];
    },

    waitForRequestCompletedAction() {
      return actionCompletionMiddleware.promise;
    },
  };
}

export interface CommerceEngineDefinition<
  TControllers extends ControllerDefinitionsMap<SSRCommerceEngine, Controller>,
  TSolutionType extends SolutionType,
> extends EngineDefinition<
    SSRCommerceEngine,
    TControllers,
    CommerceEngineOptions,
    TSolutionType
  > {}

/**
 * Initializes a Commerce engine definition in SSR with given controllers definitions and commerce engine config.
 * @param options - The commerce engine definition
 * @returns Three utility functions to fetch the initial state of the engine in SSR, hydrate the state in CSR,
 *  and a build function that can be used for edge cases requiring more control.
 */
export function defineCommerceEngine<
  TControllerDefinitions extends ControllerDefinitionsMap<
    SSRCommerceEngine,
    Controller
  >,
>(
  options: CommerceEngineDefinitionOptions<TControllerDefinitions>
): {
  listingEngineDefinition: CommerceEngineDefinition<
    TControllerDefinitions,
    SolutionType.listing
  >;
  searchEngineDefinition: CommerceEngineDefinition<
    TControllerDefinitions,
    SolutionType.search
  >;
  standaloneEngineDefinition: CommerceEngineDefinition<
    TControllerDefinitions,
    SolutionType.standalone
  >;
} {
  const {controllers: controllerDefinitions, ...engineOptions} = options;
  type Definition = CommerceEngineDefinition<
    TControllerDefinitions,
    SolutionType
  >;
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

  const buildFactory =
    <T extends SolutionType>(solutionType: T) =>
    async (...[buildOptions]: BuildParameters) => {
      const engine = buildSSRCommerceEngine(
        solutionType,
        buildOptions?.extend
          ? await buildOptions.extend(getOptions())
          : getOptions()
      );
      const controllers = buildControllerDefinitions({
        definitionsMap: (controllerDefinitions ?? {}) as TControllerDefinitions,
        engine,
        solutionType,
        propsMap: (buildOptions && 'controllers' in buildOptions
          ? buildOptions.controllers
          : {}) as InferControllerPropsMapFromDefinitions<TControllerDefinitions>,
      });

      return {
        engine,
        controllers,
      };
    };

  const fetchStaticStateFactory: (
    solutionType: SolutionType
  ) => FetchStaticStateFunction = (solutionType: SolutionType) =>
    composeFunction(
      async (...params: FetchStaticStateParameters) => {
        if (!getOptions().navigatorContextProvider) {
          // TODO: KIT-3409 - implement a logger to log SSR warnings/errors
          console.warn(
            '[WARNING] Missing navigator context in server-side code. Make sure to set it with `setNavigatorContextProvider` before calling fetchStaticState()'
          );
        }
        const buildResult = await buildFactory(solutionType)(...params);
        const staticState = await fetchStaticStateFactory(
          solutionType
        ).fromBuildResult({
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

          if (solutionType === SolutionType.listing) {
            buildProductListing(engine).executeFirstRequest();
          } else if (solutionType === SolutionType.search) {
            buildSearch(engine).executeFirstSearch();
          }

          const searchAction = await engine.waitForRequestCompletedAction();

          return createStaticState({
            searchAction,
            controllers,
          }) as EngineStaticState<
            UnknownAction,
            InferControllerStaticStateMapFromDefinitionsWithSolutionType<
              TControllerDefinitions,
              SolutionType
            >
          >;
        },
      }
    );

  const hydrateStaticStateFactory: (
    solutionType: SolutionType
  ) => HydrateStaticStateFunction = (solutionType: SolutionType) =>
    composeFunction(
      async (...params: HydrateStaticStateParameters) => {
        if (!getOptions().navigatorContextProvider) {
          // TODO: KIT-3409 - implement a logger to log SSR warnings/errors
          console.warn(
            '[WARNING] Missing navigator context in client-side code. Make sure to set it with `setNavigatorContextProvider` before calling hydrateStaticState()'
          );
        }
        const buildResult = await buildFactory(solutionType)(
          ...(params as BuildParameters)
        );
        const staticState = await hydrateStaticStateFactory(
          solutionType
        ).fromBuildResult({
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
          await engine.waitForRequestCompletedAction();
          return {engine, controllers};
        },
      }
    );
  return {
    listingEngineDefinition: {
      build: buildFactory(SolutionType.listing),
      fetchStaticState: fetchStaticStateFactory(SolutionType.listing),
      hydrateStaticState: hydrateStaticStateFactory(SolutionType.listing),
      setNavigatorContextProvider,
    } as CommerceEngineDefinition<TControllerDefinitions, SolutionType.listing>,
    searchEngineDefinition: {
      build: buildFactory(SolutionType.search),
      fetchStaticState: fetchStaticStateFactory(SolutionType.search),
      hydrateStaticState: hydrateStaticStateFactory(SolutionType.search),
      setNavigatorContextProvider,
    } as CommerceEngineDefinition<TControllerDefinitions, SolutionType.search>,
    standaloneEngineDefinition: {
      build: buildFactory(SolutionType.standalone),
      fetchStaticState: fetchStaticStateFactory(SolutionType.standalone),
      hydrateStaticState: hydrateStaticStateFactory(SolutionType.standalone),
      setNavigatorContextProvider,
    } as CommerceEngineDefinition<
      TControllerDefinitions,
      SolutionType.standalone
    >,
  };
}
