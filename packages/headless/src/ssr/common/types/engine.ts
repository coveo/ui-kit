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
  TControllers extends ControllerDefinitionsMap<CoreEngine | CoreEngineNext, Controller>,
> = TOptions & {
  /**
   * The controllers to initialize with the search engine.
   */
  controllers?: TControllers;
};

export interface EngineDefinition<
  TEngine extends CoreEngine | CoreEngineNext,
  TControllers extends ControllerDefinitionsMap<TEngine, Controller>,
  TEngineOptions,
> {
  /**
   * Fetches the static state on the server side using your engine definition.
   */
  fetchStaticState: FetchStaticState<
    TEngine,
    InferControllersMapFromDefinition<TControllers>,
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
   * @deprecated This method will be removed in a future major version. It mutates the shared engine
   * definition, so on a server handling concurrent requests one request can overwrite another
   * request's navigator context. Pass a `navigatorContextProvider` to `defineSearchEngine()` instead.
   *
   * Sets the navigator context provider.
   * This provider is essential for retrieving navigation-related data such as referrer, userAgent, location, and clientId, which are crucial for handling both server-side and client-side API requests effectively.
   *
   * Note: The implementation specifics of the navigator context provider depend on the Node.js framework being utilized. It is the developer's responsibility to appropriately define and implement the navigator context provider to ensure accurate navigation context is available throughout the application. If the user fails to provide a navigator context provider, a warning will be logged either on the server or the browser console.
   */
  setNavigatorContextProvider: (navigatorContextProvider: NavigatorContextProvider) => void;
  /**
   * @deprecated This method is deprecated and will be removed in a future major version. Use the `fetchStaticState` method instead.
   *
   * Builds an engine and its controllers from an engine definition.
   */
  build: Build<
    TEngine,
    TEngineOptions,
    InferControllersMapFromDefinition<TControllers>,
    InferControllerPropsMapFromDefinitions<TControllers>
  >;

  /**
   * @deprecated This method will be removed in a future major version, and
   * `@coveo/headless/ssr-next` no longer has it. Keep track of the token you configure instead of
   * reading it back from the shared engine definition.
   *
   * Returns the access token.
   */
  getAccessToken: () => string;

  /**
   * @deprecated This method will be removed in a future major version, and
   * `@coveo/headless/ssr-next` no longer has it. It mutates the shared engine definition, so on a
   * server handling concurrent requests one request can overwrite another request's token. To
   * renew an expiring token, configure `renewAccessToken` on the engine configuration. To switch the
   * token of an engine you already hold, such as a hydrated engine after the user signs in, dispatch
   * `loadConfigurationActions(engine).updateBasicConfiguration({accessToken})` on that engine. To
   * use a different token per request, use `@coveo/headless/ssr-next`, whose `fetchStaticState()`
   * and `hydrateStaticState()` take an `accessToken`.
   *
   * Updates the access token.
   * @param accessToken - The access token to update.
   */
  setAccessToken: (accessToken: string) => void;
}

/**
 * @deprecated Use SearchEngineDefinitionBuildResult or CommerceEngineDefinitionBuildResult instead
 */
export interface EngineDefinitionBuildResult<
  TEngine extends CoreEngine | CoreEngineNext,
  TControllers extends ControllersMap,
> {
  engine: TEngine;
  controllers: TControllers;
}

export type EngineDefinitionControllersPropsOption<
  TControllersPropsMap extends ControllersPropsMap,
> =
  HasKeys<TControllersPropsMap> extends false
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

/**
 * @deprecated This type is deprecated and will be removed in a future version.
 * {@link EngineDefinition.build} will be removed in a future version.
 */
export type InferBuildResult<
  T extends {
    build(...args: unknown[]): Promise<unknown>;
  },
> = Awaited<ReturnType<T['build']>>;
