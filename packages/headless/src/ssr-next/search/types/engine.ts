import type {AnyAction} from '@reduxjs/toolkit';
import type {CoreEngine, CoreEngineNext} from '../../../app/engine.js';
import type {NavigatorContextProvider} from '../../../app/navigator-context-provider.js';
import type {SearchEngineOptions} from '../../../app/search-engine/search-engine.js';
import type {Controller} from '../../../controllers/controller/headless-controller.js';
import type {
  ControllersMap,
  ControllersPropsMap,
} from '../../common/types/controllers.js';
import type {HasKeys} from '../../common/types/utilities.js';
import type {SSRSearchEngine} from '../engine/search-engine.ssr.js';
import type {Build} from './build.js';
import type {ControllerDefinitionsMap} from './controller-definition.js';
import type {
  InferControllerPropsMapFromDefinitions,
  InferControllerStaticStateMapFromDefinitions,
  InferControllersMapFromDefinition,
} from './controller-inference.js';
import type {FetchStaticState} from './fetch-static-state.js';
import type {HydrateStaticState} from './hydrate-static-state.js';

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

/**
 * The options to create a search engine definition in SSR.
 *
 * @group Engine
 */
export type SearchEngineDefinitionOptions<
  TControllers extends ControllerDefinitionsMap<SSRSearchEngine, Controller>,
> = SearchEngineOptions & {
  /**
   * The controllers to initialize with the search engine.
   */
  controllers?: TControllers;
};

export interface SearchEngineDefinition<
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

/**
 * This type defines the required and optional controller props for the commerce engine definition.
 */
export type SearchEngineDefinitionControllersPropsOption<
  TControllersPropsMap extends ControllersPropsMap,
> = HasKeys<TControllersPropsMap> extends false
  ? {}
  : {
      controllers: TControllersPropsMap;
    };

export interface SearchEngineDefinitionBuildResult<
  TEngine extends CoreEngine | CoreEngineNext,
  TControllers extends ControllersMap,
> {
  engine: TEngine;
  controllers: TControllers;
}
