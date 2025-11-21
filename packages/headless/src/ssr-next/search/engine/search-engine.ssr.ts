/**
 * Utility functions to be used for Server Side Rendering.
 */
import {defineSearchParameterManager} from '../controllers/search-parameter-manager/headless-search-parameter-manager.ssr.js';
import {hydratedStaticStateFactory} from '../factories/hydrated-state-factory.js';
import {fetchStandaloneStaticStateFactory} from '../factories/standalone-static-state-factory.js';
import {fetchStaticStateFactory} from '../factories/static-state-factory.js';
import type {SSRSearchEngine} from '../types/build.js';
import type {AugmentedControllerDefinition} from '../types/controller-definition.js';
import type {
  SearchControllerDefinitionsMap,
  SearchEngineDefinition,
  SearchEngineDefinitionOptions,
} from '../types/engine.js';

/**
 * Initializes a Search engine definition in SSR with given controllers definitions and search engine config.
 *
 * @param options - The search engine definition
 * @returns An object containing two engine definitions:
 * - `searchEngineDefinition`: For pages with search results (executes server-side search)
 * - `standaloneEngineDefinition`: For pages with standalone components only (no server-side search execution)
 *
 * @remarks
 * You can use the {@link InferStaticState} and {@link InferHydratedState} utility types with the returned engine definitions
 * to infer the types of static and hydrated state for your controllers.
 *
 * @example
 * ```ts
 * const {searchEngineDefinition, standaloneEngineDefinition} = defineSearchEngine(config);
 *
 * // For search results pages
 * const searchState = await searchEngineDefinition.fetchStaticState({
 *   navigatorContext: {/*...* /},
 *   searchParams: {q: 'query'}
 * });
 *
 * // For pages with standalone search box only (e.g., homepage)
 * const standaloneState = await standaloneEngineDefinition.fetchStaticState({
 *   navigatorContext: {/*...* /},
 * });
 *
 * type SearchStaticState = InferStaticState<typeof searchEngineDefinition>;
 * type SearchHydratedState = InferHydratedState<typeof searchEngineDefinition>;
 * ```
 *
 * @group Engine
 */
export function defineSearchEngine<
  TControllerDefinitions extends SearchControllerDefinitionsMap = {},
>(
  options: SearchEngineDefinitionOptions<TControllerDefinitions>
): {
  searchEngineDefinition: SearchEngineDefinition<
    SSRSearchEngine,
    TControllerDefinitions
  >;
  standaloneEngineDefinition: SearchEngineDefinition<
    SSRSearchEngine,
    TControllerDefinitions
  >;
} {
  const {controllers: controllerDefinitions, ...engineOptions} = options;

  const getOptions = () => engineOptions;

  const getAccessToken = () => engineOptions.configuration.accessToken;

  const setAccessToken = (accessToken: string) => {
    // TODO: KIT-5150 - Apply `setAccessToken` propagation fix for SSR search
    engineOptions.configuration.accessToken = accessToken;
  };

  const augmentedControllerDefinition = {
    ...controllerDefinitions,
    parameterManager: defineSearchParameterManager(),
  } as AugmentedControllerDefinition<TControllerDefinitions>;

  const fetchStaticState = fetchStaticStateFactory<TControllerDefinitions>(
    augmentedControllerDefinition,
    getOptions()
  );

  const fetchStandaloneStaticState =
    fetchStandaloneStaticStateFactory<TControllerDefinitions>(
      augmentedControllerDefinition,
      getOptions()
    );

  const hydrateStaticState = hydratedStaticStateFactory<TControllerDefinitions>(
    augmentedControllerDefinition,
    getOptions()
  );

  const commonMethods = {
    getAccessToken,
    setAccessToken,
  };

  return {
    searchEngineDefinition: {
      fetchStaticState,
      hydrateStaticState,
      ...commonMethods,
    },
    standaloneEngineDefinition: {
      fetchStaticState: fetchStandaloneStaticState,
      hydrateStaticState,
      ...commonMethods,
    },
  };
}
