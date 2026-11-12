import type {SearchEngineOptions} from '../../../app/search-engine/search-engine.js';
import type {Controller} from '../../../controllers/controller/headless-controller.js';
import type {EngineDefinition} from '../../common/types/engine.js';
import type {BuildConfig, SSRSearchEngine} from './build.js';
import type {ControllerDefinitionsMap} from './controller-definition.js';
import type {SearchStaticState} from './fetch-static-state.js';
import type {SearchHydratedState} from './hydrate-static-state.js';

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
  BuildConfig
> {
  /**
   * Fetches the static state on the server side using your engine definition.
   *
   * @param params - The page facts: the navigator context, the search parameters, the custom
   *  context and the per-request access token.
   * @returns A Promise that resolves to the static state.
   */
  fetchStaticState: (params: BuildConfig) => Promise<SearchStaticState<TControllers>>;
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
