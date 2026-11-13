import type {SearchEngineOptions} from '../../../app/search-engine/search-engine.js';
import type {Controller} from '../../../controllers/controller/headless-controller.js';
import type {ControllersPropsMap} from '../../common/types/controllers.js';
import type {EngineDefinition} from '../../common/types/engine.js';
import type {HasKeys} from '../../common/types/utilities.js';
import type {BuildConfig, SSRSearchEngine} from './build.js';
import type {ControllerDefinitionsMap} from './controller-definition.js';
import type {InferControllerPropsMapFromDefinitions} from './controller-inference.js';
import type {SearchStaticState} from './fetch-static-state.js';
import type {SearchHydratedState} from './hydrate-static-state.js';

type ReservedControllerNames = 'parameterManager';

type ValidateControllerNames<T extends SearchControllerDefinitionsMap> = {
  [K in keyof T]: K extends ReservedControllerNames
    ? `ERROR: Controller name "${K & string}" is reserved and cannot be used. Please choose a different controller name.`
    : T[K];
};

/**
 * The options to create a search engine definition in SSR.
 *
 * The navigator context is per-request data: it is passed to `fetchStaticState()` rather than to the
 * engine definition.
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

/**
 * The options of `fetchStaticState()`: the build configuration, and the props of the controllers
 * that take some.
 */
type FetchStaticStateOptions<TControllers extends SearchControllerDefinitionsMap> = BuildConfig &
  SearchEngineDefinitionControllersPropsOption<
    InferControllerPropsMapFromDefinitions<TControllers>
  >;

/**
 * A search engine definition.
 *
 * @typeParam TControllers - The controllers passed to `defineSearchEngine()`.
 *
 * @group Engine
 */
export interface SearchEngineDefinition<
  TControllers extends SearchControllerDefinitionsMap,
> extends EngineDefinition<
  SearchStaticState<TControllers>,
  SearchHydratedState<TControllers>,
  FetchStaticStateOptions<TControllers>
> {
  /**
   * Fetches the static state on the server side using your engine definition.
   *
   * @param params - The navigator context, the search parameters, the per-request access token, and
   *  the props of the controllers that take some.
   * @returns A Promise that resolves to the static state.
   */
  fetchStaticState: (
    params: FetchStaticStateOptions<TControllers>
  ) => Promise<SearchStaticState<TControllers>>;
  /**
   * Builds the engine and the live controllers on the client side from the static state.
   *
   * @param staticState - The static state returned by `fetchStaticState()`, passed as is.
   * @returns A Promise that resolves to the hydrated engine and the live controllers.
   */
  hydrateStaticState: (
    staticState: SearchStaticState<TControllers>
  ) => Promise<SearchHydratedState<TControllers>>;
}

/**
 * This type defines the required and optional controller props for the search engine definition.
 */
type SearchEngineDefinitionControllersPropsOption<
  TControllersPropsMap extends ControllersPropsMap,
> =
  HasKeys<TControllersPropsMap> extends false
    ? {}
    : {
        controllers: TControllersPropsMap;
      };

export type SearchControllerDefinitionsMap = ControllerDefinitionsMap<SSRSearchEngine, Controller>;

type Definition<TControllerDefinitions extends SearchControllerDefinitionsMap> =
  SearchEngineDefinition<TControllerDefinitions>;

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
