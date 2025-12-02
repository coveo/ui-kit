import type {UnknownAction} from '@reduxjs/toolkit';
import type {CoreEngine, CoreEngineNext} from '../../../app/engine.js';
import type {SearchEngineOptions} from '../../../app/search-engine/search-engine.js';
import type {Controller} from '../../../controllers/controller/headless-controller.js';
import type {
  ControllersMap,
  ControllersPropsMap,
} from '../../common/types/controllers.js';
import type {HasKeys} from '../../common/types/utilities.js';
import type {SSRSearchEngine} from './build.js';
import type {ControllerDefinitionsMap} from './controller-definition.js';
import type {
  InferControllerPropsMapFromDefinitions,
  InferControllerStaticStateMapFromDefinitions,
  InferControllersMapFromDefinition,
} from './controller-inference.js';
import type {FetchStaticState} from './fetch-static-state.js';
import type {HydrateStaticState} from './hydrate-static-state.js';

type ReservedControllerNames = 'parameterManager';

type ValidateControllerNames<T extends SearchControllerDefinitionsMap> = {
  [K in keyof T]: K extends ReservedControllerNames
    ? `ERROR: Controller name "${K & string}" is reserved and cannot be used. Please choose a different controller name.`
    : T[K];
};

/**
 * The options to create a search engine definition in SSR.
 *
 * @group Engine
 */
export type SearchEngineDefinitionOptions<
  TControllers extends SearchControllerDefinitionsMap = {},
> = SearchEngineOptions & {
  /**
   * The controllers to initialize with the search engine.
   */
  controllers?: ValidateControllerNames<TControllers>;
  /**
   * Callback invoked when the access token changes.
   */
  onAccessTokenUpdate?: (updateCallback: (token: string) => void) => void;
};

export interface SearchEngineDefinition<
  TEngine extends CoreEngine | CoreEngineNext,
  TControllers extends ControllerDefinitionsMap<TEngine, Controller>,
> {
  /**
   * Fetches the static state on the server side using your engine definition.
   */
  fetchStaticState: FetchStaticState<
    UnknownAction,
    InferControllerStaticStateMapFromDefinitions<TControllers>,
    InferControllerPropsMapFromDefinitions<TControllers>
  >;
  /**
   * Fetches the hydrated state on the client side using your engine definition and the static state.
   */
  hydrateStaticState: HydrateStaticState<
    TEngine,
    InferControllersMapFromDefinition<TControllers>,
    UnknownAction,
    InferControllerPropsMapFromDefinitions<TControllers>
  >;
  /**
   * Returns the access token.
   */
  getAccessToken: () => string;

  /**
   * Updates the access token.
   * @param accessToken - The access token to update.
   */
  setAccessToken: (accessToken: string) => void;
}

/**
 * This type defines the required and optional controller props for the search engine definition.
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

export type SearchControllerDefinitionsMap = ControllerDefinitionsMap<
  SSRSearchEngine,
  Controller
>;

type Definition<TControllerDefinitions extends SearchControllerDefinitionsMap> =
  SearchEngineDefinition<SSRSearchEngine, TControllerDefinitions>;

export type FetchStaticStateFunction<
  TControllerDefinitions extends SearchControllerDefinitionsMap,
> = Definition<TControllerDefinitions>['fetchStaticState'];

export type HydrateStaticStateFunction<
  TControllerDefinitions extends SearchControllerDefinitionsMap,
> = Definition<TControllerDefinitions>['hydrateStaticState'];

export type FetchStaticStateParameters<
  TControllerDefinitions extends SearchControllerDefinitionsMap,
> = Parameters<FetchStaticStateFunction<TControllerDefinitions>>[0];

export type HydrateStaticStateParameters<
  TControllerDefinitions extends SearchControllerDefinitionsMap,
> = Parameters<HydrateStaticStateFunction<TControllerDefinitions>>[0];
