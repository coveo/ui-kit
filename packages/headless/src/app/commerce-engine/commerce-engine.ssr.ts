/**
 * Utility functions to be used for Commerce Server Side Rendering.
 */
import {Action, UnknownAction} from '@reduxjs/toolkit';
import {stateKey} from '../../app/state-key';
import {buildProductListing} from '../../controllers/commerce/product-listing/headless-product-listing';
import type {Controller} from '../../controllers/controller/headless-controller';
import {createWaitForActionMiddleware} from '../../utils/utils';
import {
  buildControllerDefinitions,
  composeFunction,
  createStaticState,
} from '../ssr-engine/common';
import {
  ControllerDefinitionsMap,
  InferControllerPropsMapFromDefinitions,
} from '../ssr-engine/types/common';
import {
  EngineDefinition,
  EngineDefinitionOptions,
} from '../ssr-engine/types/core-engine';
import {
  CommerceEngine,
  CommerceEngineOptions,
  buildCommerceEngine,
} from './commerce-engine';

/**
 * The SSR commerce engine.
 */
export interface SSRCommerceEngine extends CommerceEngine {
  /**
   * Waits for the search to be completed and returns a promise that resolves to a `SearchCompletedAction`.
   */
  waitForSearchCompletedAction(): Promise<Action>;
}

export type CommerceEngineDefinitionOptions<
  TControllers extends ControllerDefinitionsMap<SSRCommerceEngine, Controller>,
> = EngineDefinitionOptions<CommerceEngineOptions, TControllers>;

function isListingFetchCompletedAction(action: unknown): action is Action {
  return /^commerce\/productListing\/fetch\/(fulfilled|rejected)$/.test(
    (action as UnknownAction).type
  );
}

// TODO: KIT-3394 - Uncomment this function when implementing the search solution type
// function isSearchCompletedAction(action: unknown): action is Action {
//   return /^commerce\/search\/executeSearch\/(fulfilled|rejected)$/.test(
//     (action as UnknownAction).type
//   );
// }

function buildSSRCommerceEngine(
  options: CommerceEngineOptions
): SSRCommerceEngine {
  const {middleware, promise} = createWaitForActionMiddleware(
    isListingFetchCompletedAction
    // TODO: KIT-3394 - Implement the logic for the search solution type
    // isSearchCompletedAction
  );
  const commerceEngine = buildCommerceEngine({
    ...options,
    middlewares: [...(options.middlewares ?? []), middleware],
  });
  return {
    ...commerceEngine,

    get [stateKey]() {
      return commerceEngine[stateKey];
    },

    waitForSearchCompletedAction() {
      return promise;
    },
  };
}

export interface CommerceEngineDefinition<
  TControllers extends ControllerDefinitionsMap<SSRCommerceEngine, Controller>,
> extends EngineDefinition<
    SSRCommerceEngine,
    TControllers,
    CommerceEngineOptions
  > {}

/**
 * @internal
 * Initializes a Commerce engine definition in SSR with given controllers definitions and commerce engine config.
 * @param options - The commerce engine definition
 * @returns Three utility functions to fetch the initial state of the engine in SSR, hydrate the state in CSR,
 *  and a build function that can be used for edge cases requiring more control.
 */
export function defineCommerceEngine<
  TControllerDefinitions extends ControllerDefinitionsMap<
    CommerceEngine,
    Controller
  >,
>(
  options: CommerceEngineDefinitionOptions<TControllerDefinitions>
): CommerceEngineDefinition<TControllerDefinitions> {
  const {controllers: controllerDefinitions, ...engineOptions} = options;
  type Definition = CommerceEngineDefinition<TControllerDefinitions>;
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

  const getOpts = () => {
    return engineOptions;
  };

  const build: BuildFunction = async (...[buildOptions]: BuildParameters) => {
    const engine = buildSSRCommerceEngine(
      buildOptions?.extend ? await buildOptions.extend(getOpts()) : getOpts()
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

        buildProductListing(engine).executeFirstRequest();
        // TODO: KIT-3394 - Implement the logic for the search solution type
        // buildSearch(engine).executeFirstSearch();

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
