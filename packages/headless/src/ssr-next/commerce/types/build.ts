import type {CommerceEngineOptions} from '../../../app/commerce-engine/commerce-engine.js';
import type {NavigatorContext} from '../../../app/navigator-context-provider.js';
import type {Controller} from '../../../controllers/controller/headless-controller.js';
import type {HasKey} from '../../common/types/utilities.js';
import type {CartInitialState} from '../controllers/cart/headless-cart.ssr.js';
import type {ContextOptions} from '../controllers/context/headless-context.ssr.js';
import type {
  ParameterManagerState,
  Parameters,
} from '../controllers/parameter-manager/headless-core-parameter-manager.ssr.js';
import type {SolutionType} from './controller-constants.js';
import type {
  ControllerDefinitionsMap,
  IsRecommendationController,
} from './controller-definitions.js';

export interface SearchBuildConfig extends CommonBuildConfig {
  searchParams: ParameterManagerState<
    Parameters & {
      /**
       * The query.
       */
      q?: string;
    }
  >['parameters'];
}

export interface ListingBuildConfig extends CommonBuildConfig {}

export interface StandaloneBuildConfig extends CommonBuildConfig {}

/**
 * Commerce engine options for SSR scenarios where context is defined when fetching static state.
 */
export type SSRCommerceEngineOptions = Omit<
  CommerceEngineOptions,
  'configuration'
> & {
  configuration: Omit<CommerceEngineOptions['configuration'], 'context'>;
};

/**
 * The `RecommendationBuildConfig` type defines the shape of the configuration object required when fetching static state for recommendations.
 *
 * The `recommendations` property is a string array containing the names of the recommendation controllers
 * that were defined in your engine definition. This allows you to specify which recommendation controllers
 * should be included in the SSR request.
 *
 * For example, on a storefront homepage, it might make sense to display a carousel of popular products.
 * However, showing recommendations based on items frequently bought together may not be relevant in that context and should not be retrieved unnecessarily.
 *
 * @example
 * Given the following engine definition:
 *
 * ```ts
 * const {recommendationEngineDefinition} = defineCommerceEngine({
 *   controllers: {
 *     popularProducts: defineRecommendations({options: {slotId: '...'}}),
 *     frequentlyBought: defineRecommendations({options: {slotId: '...'}}),
 *     // ...other controllers
 *   },
 * });
 *
 * // When fetching static state for recommendations:
 * const staticState = await recommendationEngineDefinition.fetchStaticState({
 *   recommendations: ['popularProducts'],
 *   // ...other config
 * });
 * ```
 *
 * In this example, only the `popularProducts` recommendation controller will be included in the SSR request.
 */
export type RecommendationBuildConfig<
  TControllers extends ControllerDefinitionsMap<Controller>,
> = CommonBuildConfig & {
  /**
   * The unique identifier of the product to use for seeded recommendations.
   */
  productId?: string;
  /**
   * An array of recommendation controller names from your engine definition to include in the SSR request.
   * Each name corresponds to a key used when defining recommendation controllers in your engine definition.
   * If not specified, no recommendation requests will be executed.
   */
  recommendations: Array<
    Extract<
      keyof TControllers,
      {
        [K in keyof TControllers]: HasKey<
          TControllers[K],
          SolutionType.recommendation
        > extends never
          ? never
          : IsRecommendationController<TControllers[K]> extends never
            ? never
            : K;
      }[keyof TControllers]
    >
  >;
};

export interface ListingBuildConfig extends CommonBuildConfig {}

export interface StandaloneBuildConfig extends CommonBuildConfig {}

export interface CommonBuildConfig {
  /**
   * The `NavigatorContext` interface represents the context of the browser client.
   * See {@link NavigatorContext}
   */
  navigatorContext: NavigatorContext;

  /**
   * The initial context options passed to the engine when fetching the static state.
   *
   * This property is used to configure the commerce context (e.g., currency, language, country)
   * when calling `fetchStaticState()`.
   *
   * @remarks
   * To access the context after engine creation, use the context controller.
   *
   * @example
   * ```typescript
   * // Setting context during static state fetch
   * const staticState = await engineDefinition.fetchStaticState({
   *   context: { currency: 'USD', language: 'en', country: 'US' },
   *   // ...other config
   * });
   *
   * // Reading context from the static state
   * const {context} = staticState.controllers;
   * console.log(context.state.currency); // 'USD'
   * ```
   */
  context: ContextOptions;

  /**
   * The initial search parameters to apply when fetching the static state.
   *
   * This property allows you to set initial search parameters (filters, facets, query, etc.)
   * that will be applied during the server-side search execution.
   *
   * @remarks
   * To access search parameters after engine creation, use the parameter manager controller.
   *
   * @example
   * ```typescript
   * // Setting search parameters during static state fetch
   * const staticState = await engineDefinition.fetchStaticState({
   *   searchParams: {
   *     q: 'shoes',
   *   },
   *   // ...other config
   * });
   *
   * // Reading search parameters from the static state
   * const {parameterManager} = staticState.controllers;
   * console.log(parameterManager.state.parameters.q); // 'shoes'
   * ```
   */
  searchParams?: ParameterManagerState<Parameters>['parameters'];

  /**
   * The initial cart state to apply when fetching the static state.
   *
   * This property allows you to set an initial cart state that will be used during
   * server-side rendering.
   *
   * @remarks
   * To access cart state after engine creation, use the cart controller.
   *
   * @example
   * ```typescript
   * // Setting cart state during static state fetch
   * const staticState = await engineDefinition.fetchStaticState({
   *   cart: {
   *     // This is a simplified example. The actual item structure may require additional properties.
   *     items: [{ productId: 'abc123', quantity: 1 }]
   *   },
   *   // ...other config
   * });
   *
   * // Reading cart state from the static state
   * const {cart} = staticState.controllers;
   * console.log(cart.state.items.length); // 1
   * ```
   */
  cart?: CartInitialState;
}

export type BuildConfig<
  TControllers extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
> = TSolutionType extends SolutionType.search
  ? SearchBuildConfig
  : TSolutionType extends SolutionType.listing
    ? ListingBuildConfig
    : TSolutionType extends SolutionType.recommendation
      ? RecommendationBuildConfig<TControllers>
      : TSolutionType extends SolutionType.standalone
        ? CommonBuildConfig
        : never;
