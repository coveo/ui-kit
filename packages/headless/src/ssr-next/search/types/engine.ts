/**
 * Utility functions to be used for Server Side Rendering.
 */
import type {
  SearchEngine,
  SearchEngineOptions,
} from '../../../app/search-engine/search-engine.js';
import type {Controller} from '../../../controllers/controller/headless-controller.js';
import type {LegacySearchAction} from '../../../features/analytics/analytics-utils.js';
import type {ControllerDefinitionsMap} from '../../common/types/controllers.js';
import type {
  EngineBuildResult,
  EngineDefinition,
  EngineDefinitionOptions,
} from '../../common/types/engine.js';

export type SearchCompletedAction = ReturnType<
  LegacySearchAction['fulfilled' | 'rejected']
>;

/**
 * The SSR search engine.
 *
 * @group Engine
 */
export interface SSRSearchEngine extends SearchEngine {
  /**
   * Waits for the search to be completed and returns a promise that resolves to a `SearchCompletedAction`.
   */
  waitForSearchCompletedAction(): Promise<SearchCompletedAction>;
}

type SearchEngineDefinition<
  TControllers extends ControllerDefinitionsMap<SSRSearchEngine, Controller>,
> = EngineDefinition<SSRSearchEngine, TControllers>;

/**
 * The options to create a search engine definition in SSR.
 *
 * @group Engine
 */
export type SearchEngineDefinitionOptions<
  TControllers extends ControllerDefinitionsMap<SSRSearchEngine, Controller>,
> = EngineDefinitionOptions<SearchEngineOptions, TControllers>;

export type BuildFunction<TControllerDefinitions extends DefinitionMap> =
  EngineBuildResult<
    SSRSearchEngine,
    TControllerDefinitions,
    SearchEngineOptions
  >;

type DefinitionMap = ControllerDefinitionsMap<SSRSearchEngine, Controller>;

type Definition<TControllerDefinitions extends DefinitionMap> =
  SearchEngineDefinition<TControllerDefinitions>;

export type FetchStaticStateFunction<
  TControllerDefinitions extends DefinitionMap,
> = Definition<TControllerDefinitions>['fetchStaticState'];

export type HydrateStaticStateFunction<
  TControllerDefinitions extends DefinitionMap,
> = Definition<TControllerDefinitions>['hydrateStaticState'];

export type BuildParameters<TControllerDefinitions extends DefinitionMap> =
  Parameters<BuildFunction<TControllerDefinitions>>;

export type FetchStaticStateParameters<
  TControllerDefinitions extends DefinitionMap,
> = Parameters<FetchStaticStateFunction<TControllerDefinitions>>;

export type HydrateStaticStateParameters<
  TControllerDefinitions extends DefinitionMap,
> = Parameters<HydrateStaticStateFunction<TControllerDefinitions>>;
