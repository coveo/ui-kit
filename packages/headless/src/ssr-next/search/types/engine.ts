import type {UnknownAction} from '@reduxjs/toolkit';
import type {CoreEngine, CoreEngineNext} from '../../../app/engine.js';
import type {SearchEngineOptions} from '../../../app/search-engine/search-engine.js';
import type {Controller} from '../../../controllers/controller/headless-controller.js';
import type {ControllersMap} from '../../common/types/controllers.js';
import type {SSRSearchEngine} from './build.js';
import type {ControllerDefinitionsMap} from './controller-definition.js';
import type {
  InferControllerStaticStateMapFromDefinitions,
  InferControllersMapFromDefinition,
} from './controller-inference.js';
import type {FetchStaticState} from './fetch-static-state.js';
import type {HydrateStaticState} from './hydrate-static-state.js';

type ReservedControllerNames = 'parameterManager' | 'context';

type ValidateControllerNames<T extends SearchControllerDefinitionsMap> = {
  [K in keyof T]: K extends ReservedControllerNames
    ? `ERROR: Controller name "${K & string}" is reserved and cannot be used. Reserved names are: parameterManager, context. Please choose a different controller name.`
    : T[K];
};

/**
 * The options to create a search engine definition in SSR.
 *
 * The navigator context, the search parameters and the custom context are per-request data: they are
 * passed to `fetchStaticState()` rather than to the engine definition.
 *
 * @group Engine
 */
export type SearchEngineDefinitionOptions<
  TControllers extends SearchControllerDefinitionsMap = {},
> = Omit<SearchEngineOptions, 'navigatorContextProvider'> & {
  /**
   * The controllers to initialize with the search engine.
   */
  controllers?: ValidateControllerNames<TControllers>;
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
    InferControllerStaticStateMapFromDefinitions<TControllers>
  >;
  /**
   * Fetches the hydrated state on the client side using your engine definition and the static state.
   */
  hydrateStaticState: HydrateStaticState<
    TEngine,
    InferControllersMapFromDefinition<TControllers>,
    UnknownAction,
    InferControllerStaticStateMapFromDefinitions<TControllers>
  >;
}

export interface SearchEngineDefinitionBuildResult<
  TEngine extends CoreEngine | CoreEngineNext,
  TControllers extends ControllersMap,
> {
  engine: TEngine;
  controllers: TControllers;
}

export type SearchControllerDefinitionsMap = ControllerDefinitionsMap<SSRSearchEngine, Controller>;

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
