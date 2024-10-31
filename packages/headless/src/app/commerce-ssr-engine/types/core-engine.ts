import {UnknownAction} from '@reduxjs/toolkit';
import type {Controller} from '../../../controllers/controller/headless-controller.js';
import {EngineConfiguration} from '../../engine-configuration.js';
import {CoreEngine, CoreEngineNext} from '../../engine.js';
import {NavigatorContextProvider} from '../../navigatorContextProvider.js';
import {Build} from '../../ssr-engine/types/build.js';
import {InferControllerPropsMapFromDefinitions} from '../../ssr-engine/types/common.js';
import {FetchStaticState} from '../../ssr-engine/types/fetch-static-state.js';
import {HydrateStaticState} from '../../ssr-engine/types/hydrate-static-state.js';
import {
  ControllerDefinitionsMap,
  InferControllersMapFromDefinition,
  SolutionType,
  InferControllerStaticStateMapFromDefinitionsWithSolutionType,
} from './common.js';

export type {HydrateStaticState, FetchStaticState};
export type EngineDefinitionOptions<
  TOptions extends {configuration: EngineConfiguration},
  TControllers extends ControllerDefinitionsMap<
    CoreEngine | CoreEngineNext,
    Controller
  >,
> = TOptions & {
  /**
   * The controllers to initialize with the commerce engine.
   */
  controllers?: TControllers;
};

export interface EngineDefinition<
  TEngine extends CoreEngine | CoreEngineNext,
  TControllers extends ControllerDefinitionsMap<TEngine, Controller>,
  TEngineOptions,
  TSolutionType extends SolutionType,
> {
  /**
   * Fetches the static state on the server side using your engine definition.
   */
  fetchStaticState: FetchStaticState<
    TEngine,
    InferControllersMapFromDefinition<TControllers, TSolutionType>,
    UnknownAction,
    InferControllerStaticStateMapFromDefinitionsWithSolutionType<
      TControllers,
      TSolutionType
    >,
    InferControllerPropsMapFromDefinitions<TControllers>
  >;
  /**
   * Fetches the hydrated state on the client side using your engine definition and the static state.
   */
  hydrateStaticState: HydrateStaticState<
    TEngine,
    InferControllersMapFromDefinition<TControllers, TSolutionType>,
    UnknownAction,
    InferControllerPropsMapFromDefinitions<TControllers>
  >;
  /**
   * Builds an engine and its controllers from an engine definition.
   */
  build: Build<
    TEngine,
    TEngineOptions,
    InferControllersMapFromDefinition<TControllers, TSolutionType>,
    InferControllerPropsMapFromDefinitions<TControllers>
  >;

  /**
   * Sets the navigator context provider.
   * This provider is essential for retrieving navigation-related data such as referrer, userAgent, location, and clientId, which are crucial for handling both server-side and client-side API requests effectively.
   *
   * Note: The implementation specifics of the navigator context provider depend on the Node.js framework being utilized. It is the developer's responsibility to appropriately define and implement the navigator context provider to ensure accurate navigation context is available throughout the application. If the user fails to provide a navigator context provider, a warning will be logged either on the server or the browser console.
   */
  setNavigatorContextProvider: (
    navigatorContextProvider: NavigatorContextProvider
  ) => void;
}

export type InferStaticState<
  T extends {
    fetchStaticState(...args: unknown[]): Promise<unknown>;
  },
> = Awaited<ReturnType<T['fetchStaticState']>>;

export type InferHydratedState<
  T extends {
    hydrateStaticState(...args: unknown[]): Promise<unknown>;
  },
> = Awaited<ReturnType<T['hydrateStaticState']>>;

export type InferBuildResult<
  T extends {
    build(...args: unknown[]): Promise<unknown>;
  },
> = Awaited<ReturnType<T['build']>>;
