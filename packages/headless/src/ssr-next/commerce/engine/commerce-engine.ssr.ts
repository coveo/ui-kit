/**
 * Utility functions to be used for Commerce Server Side Rendering.
 */

import type {Controller} from '../../../controllers/controller/headless-controller.js';
import type {CommerceEngineDefinitionOptions} from '../factories/build-factory.js';
import {hydratedStaticStateFactory} from '../factories/hydrated-state-factory.js';
import {hydratedRecommendationStaticStateFactory} from '../factories/recommendation-hydrated-state-factory.js';
import {fetchRecommendationStaticStateFactory} from '../factories/recommendation-static-state-factory.js';
import {fetchStaticStateFactory} from '../factories/static-state-factory.js';
import {SolutionType} from '../types/controller-constants.js';
import type {ControllerDefinitionsMap} from '../types/controller-definitions.js';
import type {CommerceEngineDefinition} from '../types/engine.js';

/**
 * Initializes a Commerce engine definition in SSR with given controllers definitions and commerce engine config.
 * @param options - The commerce engine definition
 * @returns Three utility functions to fetch the initial state of the engine in SSR, hydrate the state in CSR,
 *  and a build function that can be used for edge cases requiring more control.
 *
 * @remarks
 * You can use the {@link InferStaticState} and {@link InferHydratedState} utility types with the returned engine definitions
 * to infer the types of static and hydrated state for your controllers.
 *
 * @example
 * ```ts
 * const { listingEngineDefinition } = defineCommerceEngine(engineConfig);
 *
 * // Pass navigator context directly to fetchStaticState
 * const staticState = await listingEngineDefinition.fetchStaticState({
 *   navigatorContext: {
 *     forwardedFor: req.ip,
 *     referrer: req.headers.referer || null,
 *     userAgent: req.headers['user-agent'] || null,
 *     clientId: 'unique-session-id'
 *   }
 * });
 *
 * // Framework examples:
 * // Express.js
 * app.get('/api/listing', async (req, res) => {
 *   const state = await listingEngineDefinition.fetchStaticState({
 *     navigatorContext: {
 *       forwardedFor: req.ip,
 *       referrer: req.headers.referer || null,
 *       userAgent: req.headers['user-agent'] || null,
 *       clientId: req.sessionID
 *     }
 *   });
 *   res.json(state);
 * });
 *
 * type SearchStaticState = InferStaticState<typeof listingEngineDefinition>;
 * type SearchHydratedState = InferHydratedState<typeof listingEngineDefinition>;
 * ```
 *
 * @group Engine
 */
export function defineCommerceEngine<
  TControllerDefinitions extends ControllerDefinitionsMap<Controller>,
>(
  options: CommerceEngineDefinitionOptions<TControllerDefinitions>
): {
  listingEngineDefinition: CommerceEngineDefinition<
    TControllerDefinitions,
    SolutionType.listing
  >;
  searchEngineDefinition: CommerceEngineDefinition<
    TControllerDefinitions,
    SolutionType.search
  >;
  standaloneEngineDefinition: CommerceEngineDefinition<
    TControllerDefinitions,
    SolutionType.standalone
  >;
  recommendationEngineDefinition: CommerceEngineDefinition<
    TControllerDefinitions,
    SolutionType.recommendation
  >;
} {
  const {controllers: controllerDefinitions, ...engineOptions} = options;

  const getAccessToken = () => engineOptions.configuration.accessToken;

  const setAccessToken = (accessToken: string) => {
    engineOptions.configuration.accessToken = accessToken;
  };

  const fetchStaticState = fetchStaticStateFactory<TControllerDefinitions>(
    controllerDefinitions,
    engineOptions
  );
  const hydrateStaticState = hydratedStaticStateFactory<TControllerDefinitions>(
    controllerDefinitions,
    engineOptions
  );
  const fetchRecommendationStaticState =
    fetchRecommendationStaticStateFactory<TControllerDefinitions>(
      controllerDefinitions,
      engineOptions
    );
  const hydrateRecommendationStaticState =
    hydratedRecommendationStaticStateFactory<TControllerDefinitions>(
      controllerDefinitions,
      engineOptions
    );

  const commonMethods = {
    getAccessToken,
    setAccessToken,
  };

  return {
    listingEngineDefinition: {
      fetchStaticState: fetchStaticState(SolutionType.listing),
      hydrateStaticState: hydrateStaticState(SolutionType.listing),
      ...commonMethods,
    } as CommerceEngineDefinition<TControllerDefinitions, SolutionType.listing>,
    searchEngineDefinition: {
      fetchStaticState: fetchStaticState(SolutionType.search),
      hydrateStaticState: hydrateStaticState(SolutionType.search),
      ...commonMethods,
    } as CommerceEngineDefinition<TControllerDefinitions, SolutionType.search>,
    recommendationEngineDefinition: {
      fetchStaticState: fetchRecommendationStaticState,
      hydrateStaticState: hydrateRecommendationStaticState,
      ...commonMethods,
    } as CommerceEngineDefinition<
      TControllerDefinitions,
      SolutionType.recommendation
    >,
    // TODO KIT-3738 :  The standaloneEngineDefinition should not be async since no request is sent to the API
    standaloneEngineDefinition: {
      fetchStaticState: fetchStaticState(SolutionType.standalone),
      hydrateStaticState: hydrateStaticState(SolutionType.standalone),
      ...commonMethods,
    } as CommerceEngineDefinition<
      TControllerDefinitions,
      SolutionType.standalone
    >,
  };
}
