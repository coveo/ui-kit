import type {AnyAction, UnknownAction} from '@reduxjs/toolkit';
import type {CoreEngine, CoreEngineNext} from '../../../app/engine.js';
import type {EngineConfiguration} from '../../../app/engine-configuration.js';
import type {NavigatorContextProvider} from '../../../app/navigator-context-provider.js';
import type {Controller} from '../../../controllers/controller/headless-controller.js';
import type {Build} from './build.js';
import type {
  ControllerDefinitionsMap,
  ControllerStaticStateMap,
  ControllersMap,
  ControllersPropsMap,
} from './controllers.js';
import type {FetchStaticState} from './fetch-static-state.js';
import type {HydrateStaticState} from './hydrate-static-state.js';
import type {
  InferControllerPropsMapFromDefinitions,
  InferControllerStaticStateMapFromDefinitions,
  InferControllersMapFromDefinition,
} from './inference.js';
import type {HasKeys} from './utilities.js';

export type EngineDefinitionOptions<
  TOptions extends {configuration: EngineConfiguration},
  TControllers extends ControllerDefinitionsMap<
    CoreEngine | CoreEngineNext,
    Controller
  >,
> = TOptions & {
  /**
   * The controllers to initialize with the search engine.
   */
  controllers?: TControllers;
};

export type EngineBuildResult<
  TEngine extends CoreEngine | CoreEngineNext,
  TControllers extends ControllerDefinitionsMap<TEngine, Controller>,
  TEngineOptions,
> = Build<
  TEngine,
  TEngineOptions,
  InferControllersMapFromDefinition<TControllers>,
  InferControllerPropsMapFromDefinitions<TControllers>
>;

export interface EngineDefinition<
  TEngine extends CoreEngine | CoreEngineNext,
  TControllers extends ControllerDefinitionsMap<TEngine, Controller>,
> {
  /**
   * Fetches the static state on the server side using your engine definition.
   */
  fetchStaticState: FetchStaticState<
    AnyAction,
    InferControllerStaticStateMapFromDefinitions<TControllers>,
    InferControllerPropsMapFromDefinitions<TControllers>
  >;
  /**
   * Fetches the hydrated state on the client side using your engine definition and the static state.
   */
  hydrateStaticState: HydrateStaticState<
    TEngine,
    InferControllersMapFromDefinition<TControllers>,
    AnyAction,
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

export interface EngineDefinitionBuildResult<
  TEngine extends CoreEngine | CoreEngineNext,
  TControllers extends ControllersMap,
> {
  engine: TEngine;
  controllers: TControllers;
}

export type EngineDefinitionControllersPropsOption<
  TControllersPropsMap extends ControllersPropsMap,
> = HasKeys<TControllersPropsMap> extends false
  ? {}
  : {
      controllers: TControllersPropsMap;
    };

export interface EngineStaticState<
  TSearchAction extends UnknownAction,
  TControllers extends ControllerStaticStateMap,
> {
  searchAction: TSearchAction;
  controllers: TControllers;
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
