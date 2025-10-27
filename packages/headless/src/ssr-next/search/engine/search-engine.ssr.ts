/**
 * Utility functions to be used for Server Side Rendering.
 */
import type {Controller} from '../../../controllers/controller/headless-controller.js';
import {defineSearchParameterManager} from '../controllers/search-parameter-manager/headless-search-parameter-manager.ssr.js';
import {hydratedStaticStateFactory} from '../factories/hydrated-state-factory.js';
import {fetchStaticStateFactory} from '../factories/static-state-factory.js';
import type {SSRSearchEngine} from '../types/build.js';
import type {
  AugmentedControllerDefinition,
  ControllerDefinitionsMap,
} from '../types/controller-definition.js';
import type {
  SearchEngineDefinition,
  SearchEngineDefinitionOptions,
} from '../types/engine.js';

/**
 * Initializes a Search engine definition in SSR with given controllers definitions and search engine config.
 *
 * @param options - The search engine definition
 * @returns Two utility functions to fetch the initial state of the engine in SSR and hydrate the state in CSR.
 *
 * @remarks
 * You can use the {@link InferStaticState} and {@link InferHydratedState} utility types with the returned engine definition
 * to infer the types of static and hydrated state for your controllers.
 *
 * @example
 * ```ts
 * const searchEngineDefinition = defineSearchEngine(config);
 *
 * const staticState = await searchEngineDefinition.fetchStaticState({
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
  TControllerDefinitions extends ControllerDefinitionsMap<
    SSRSearchEngine,
    Controller
  >,
>(
  options: SearchEngineDefinitionOptions<TControllerDefinitions>
): SearchEngineDefinition<SSRSearchEngine, TControllerDefinitions> {
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

  const hydrateStaticState = hydratedStaticStateFactory<TControllerDefinitions>(
    augmentedControllerDefinition,
    getOptions()
  );

  return {
    fetchStaticState,
    hydrateStaticState,
    getAccessToken,
    setAccessToken,
  };
}
