import type {CommerceEngineOptions} from '../../../app/commerce-engine/commerce-engine.js';
import type {NavigatorContext} from '../../../app/navigator-context-provider.js';
import type {Controller} from '../../../controllers/controller/headless-controller.js';
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

/**
 * The names of the recommendation controllers of an engine definition, as declared with
 * `defineRecommendations()`.
 */
export type RecommendationNames<TControllers extends ControllerDefinitionsMap<Controller>> =
  string extends keyof TControllers
    ? string
    : Extract<
        keyof TControllers & string,
        {
          [K in keyof TControllers]: IsRecommendationController<TControllers[K]> extends never
            ? never
            : K;
        }[keyof TControllers]
      >;

export interface SearchBuildConfig<
  TControllers extends ControllerDefinitionsMap<Controller> = ControllerDefinitionsMap<Controller>,
> extends CommonBuildConfig<TControllers> {
  searchParams?: ParameterManagerState<
    Parameters & {
      /**
       * The query.
       */
      q?: string;
    }
  >['parameters'];
}

export interface ListingBuildConfig<
  TControllers extends ControllerDefinitionsMap<Controller> = ControllerDefinitionsMap<Controller>,
> extends CommonBuildConfig<TControllers> {}

export interface StandaloneBuildConfig<
  TControllers extends ControllerDefinitionsMap<Controller> = ControllerDefinitionsMap<Controller>,
> extends CommonBuildConfig<TControllers> {}

/**
 * The commerce context passed to `fetchStaticState()`. The URL of the page (`view.url`) is optional:
 * it defaults to `navigatorContext.location`.
 */
export type SSRContextOptions = Omit<ContextOptions, 'view'> & {
  view?: ContextOptions['view'];
};

/**
 * Commerce engine options for SSR scenarios.
 *
 * The context and the navigator context are per-request data: they are passed to `fetchStaticState()`
 * rather than to the engine definition.
 */
export type SSRCommerceEngineOptions = Omit<
  CommerceEngineOptions,
  'configuration' | 'navigatorContextProvider'
> & {
  configuration: Omit<CommerceEngineOptions['configuration'], 'context'>;
};

/**
 * The options shared by every `fetchStaticState()` call, whatever the engine definition.
 */
export interface CommonBuildConfig<
  TControllers extends ControllerDefinitionsMap<Controller> = ControllerDefinitionsMap<Controller>,
> {
  /**
   * The `NavigatorContext` interface represents the context of the browser client.
   * See {@link NavigatorContext}
   */
  navigatorContext: NavigatorContext;

  /**
   * The commerce context of the request: the language, country and currency of the storefront, and
   * the URL of the page (`view.url`).
   *
   * When `view.url` is omitted, the URL of the page is taken from `navigatorContext.location`, so the
   * Commerce API and the analytics report the same page. Set it explicitly when the merchandising
   * configuration targets another URL than the one being rendered.
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
  context: SSRContextOptions;

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

  /**
   * The names of the recommendation controllers to request on the server, as declared in your engine
   * definition with `defineRecommendations()`. Only the listed controllers are refreshed; the others
   * keep an empty state until they are refreshed in the browser.
   *
   * The slots are requested alongside the listing or search request of the page, with the same engine,
   * so one `fetchStaticState()` call and one provider serve a page and its recommendations.
   *
   * @example
   * ```typescript
   * const staticState = await listingEngineDefinition.fetchStaticState({
   *   recommendations: ['popularViewed'],
   *   // ...other config
   * });
   * ```
   */
  recommendations?: Array<RecommendationNames<TControllers>>;

  /**
   * The unique identifier of the product being viewed, used to seed the requested recommendation slots.
   */
  productId?: string;

  /**
   * A per-request access token (for example, a per-user Coveo search token) to use for this
   * `fetchStaticState()` or `hydrateStaticState()` call only.
   *
   * When provided, it overrides the access token from the engine definition configuration for this
   * request without mutating the shared definition, which is the supported way to use per-user
   * search tokens in a multi-tenant server process. When omitted, the definition's configured
   * access token is used.
   *
   * `fetchStaticState()` returns this build configuration alongside the static state, so passing the
   * returned static state to `hydrateStaticState()` carries the token to the hydrated engine
   * automatically. That also means the token is serialized into the payload sent to the browser.
   * Use a scoped, short-lived search token rather than an API key, and do not cache a response whose
   * static state carries a per-user token, or one user's token would be served to another.
   *
   * To rotate the token of a hydrated engine that is already running, configure `renewAccessToken`
   * on the engine configuration rather than mutating the shared definition.
   */
  accessToken?: string;
}

export type BuildConfig<
  TControllers extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
> = TSolutionType extends SolutionType.search
  ? SearchBuildConfig<TControllers>
  : TSolutionType extends SolutionType.listing
    ? ListingBuildConfig<TControllers>
    : TSolutionType extends SolutionType.standalone
      ? StandaloneBuildConfig<TControllers>
      : never;
