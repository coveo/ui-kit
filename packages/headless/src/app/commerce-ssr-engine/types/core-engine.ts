import {UnknownAction} from '@reduxjs/toolkit';
import type {View} from '../../../controllers/commerce/context/headless-context';
import type {Controller} from '../../../controllers/controller/headless-controller';
import {CoreEngine, CoreEngineNext} from '../../engine';
import {EngineConfiguration} from '../../engine-configuration';
import {NavigatorContextProvider} from '../../navigatorContextProvider';
import {Build} from '../../ssr-engine/types/build';
import {InferControllerPropsMapFromDefinitions} from '../../ssr-engine/types/common';
import {FetchStaticState} from '../../ssr-engine/types/fetch-static-state';
import {HydrateStaticState} from '../../ssr-engine/types/hydrate-static-state';
import {
  ControllerDefinitionsMap,
  InferControllersMapFromDefinition,
  SolutionType,
  InferControllerStaticStateMapFromDefinitionsWithSolutionType,
} from './common';

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

  /**
   * Sets the view for the commerce engine.
   *
   * This method can be used to dynamically set the view (eg: URL) necessary for the commerce engine to function properly.
   */
  setView: (view: View) => void;
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
