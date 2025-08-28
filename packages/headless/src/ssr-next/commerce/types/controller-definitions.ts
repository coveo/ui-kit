import type {Controller} from '../../../controllers/controller/headless-controller.js';
import type {InvalidControllerDefinition} from '../../common/errors.js';
import type {ControllersPropsMap} from '../../common/types/controllers.js';
import type {HydratedState} from '../../common/types/hydrate-static-state.js';
import type {
  InferControllerStaticStateFromController,
  InferControllerStaticStateMapFromControllers,
} from '../../common/types/inference.js';
import type {
  HasKey,
  HasOptionalKeys,
  HasRequiredKeys,
  OptionsTuple,
} from '../../common/types/utilities.js';
import type {CartDefinition} from '../controllers/cart/headless-cart.ssr.js';
import type {ContextDefinition} from '../controllers/context/headless-context.ssr.js';
import type {ParameterManagerDefinition} from '../controllers/parameter-manager/headless-core-parameter-manager.ssr.js';
import type {SSRCommerceEngine} from '../factories/build-factory.js';
import {
  type recommendationInternalOptionKey,
  SolutionType,
} from './controller-constants.js';
import type {
  ListingAndStandaloneController,
  ListingOnlyController,
  NonRecommendationController,
  RecommendationOnlyController,
  SearchAndListingController,
  SearchOnlyController,
  UniversalController,
} from './controller-scopes.js';
import type {Kind} from './kind.js';
import type {HasSolutionType} from './utilities.js';

export type {
  HydratedState,
  OptionsTuple,
  InferControllerStaticStateFromController,
  InferControllerStaticStateMapFromControllers,
};

export type RecommendationControllerSettings = {
  /**
   * Toggle to enable or disable the recommendation controller.
   * When set to `true`, the controller will perform a recommendation request server-side.
   *
   * @default false
   */
  enabled?: boolean;
};

export interface ControllerDefinitionWithoutProps<
  TController extends Controller,
> {
  /**
   * Creates an instance of the given controller.
   *
   * @param engine - The search engine.
   * @param solutionType - The type of solution for which the controller should be built (e.g. search or listing). This option only applies to sub-controllers.
   * @returns The created controller instance.
   */
  build(engine: SSRCommerceEngine, solutionType?: SolutionType): TController;
}

// TODO: KIT-4781: There is no point for this interface now that the wiring is happening in headless
export interface ControllerWithKind extends Controller {
  _kind: Kind;
}

export interface ControllerDefinitionWithProps<
  TController extends Controller,
  TProps,
> {
  /**
   * Creates an instance of the given controller.
   *
   * @param engine - The search engine.
   * @param props - The controller properties.
   * @param solutionType - The type of solution for which the controller should be built (e.g. search or listing). This option only applies to sub-controllers.
   * @returns The created controller instance.
   */
  buildWithProps(
    engine: SSRCommerceEngine,
    props?: TProps,
    solutionType?: SolutionType
  ): TController & ControllerWithKind;
}

interface SolutionTypeAvailability {
  [SolutionType.search]?: boolean;
  [SolutionType.listing]?: boolean;
  [SolutionType.standalone]?: boolean;
  [SolutionType.recommendation]?: boolean;
}

export type ControllerDefinition<TController extends Controller> =
  SolutionTypeAvailability &
    (
      | ControllerDefinitionWithoutProps<TController>
      | ControllerDefinitionWithProps<TController, unknown>
    );

export interface ControllerDefinitionsMap<TController extends Controller> {
  [customName: string]: ControllerDefinition<TController>;
}

type BakedInControllerDefinitions = {
  parameterManager: ParameterManagerDefinition<{listing: true; search: true}>;
  context: ContextDefinition;
  cart: CartDefinition;
};

/**
 * Map of baked-in controllers
 */
export type BakedInControllers = {
  [K in keyof BakedInControllerDefinitions]: BakedInControllerDefinitions[K]['buildWithProps'];
};

/**
 * A dynamically filtered map of baked-in controller definitions based on solution type compatibility.
 *
 * This type automatically includes only the baked-in controllers that are available for the specified
 * solution type by checking each controller's `SolutionTypeAvailability` configuration. Controllers
 * that don't support the given solution type are excluded from the resulting type.
 *
 * @template TSolutionType - The target solution type to filter controllers for
 */
export type FilteredBakedInControllers<TSolutionType extends SolutionType> = {
  [K in keyof BakedInControllers as HasSolutionType<
    BakedInControllerDefinitions[K],
    TSolutionType
  > extends true
    ? K
    : never]: BakedInControllers[K];
};

/**
 * Map of controller definitions available to the commerce engine definition.
 *
 * This type combines user-defined controllers with the system's baked-in controllers
 * (parameterManager, context, and cart).
 *
 * @template TControllerDefinitions - The controller definitions map
 */
export type AugmentedControllerDefinition<
  TControllerDefinitions extends ControllerDefinitionsMap<Controller>,
> = TControllerDefinitions & BakedInControllerDefinitions;

/**
 * This type defines the required and optional controller props for the engine definition.
 */
export type EngineDefinitionControllersPropsOption<
  TControllers extends ControllerDefinitionsMap<Controller>,
  TControllersPropsMap extends ControllersPropsMap,
  TSolutionType extends SolutionType,
> = OptionalEngineDefinitionControllersPropsOption<
  TControllers,
  TControllersPropsMap,
  TSolutionType
> &
  RequiredEngineDefinitionControllersPropsOption<
    TControllers,
    TControllersPropsMap,
    TSolutionType
  >;

/**
 * Represents an optional engine definition for controller properties.
 *
 * This type is used to define a map of optional controller properties based on the provided
 * controller definitions, controller properties map, and solution type.
 *
 * @template TControllers - A map of controller definitions.
 * @template TControllersPropsMap - A map of controller properties.
 * @template TSolutionType - The type of solution.
 *
 * The type iterates over the controller keys (defined in the engine definition) and includes only those keys where:
 * 1. The controller can be used for a specific solution type (HasKey<TControllers[K], TSolutionType> is not 'never').
 * 2. The controller properties have optional options (HasOptionalKeys<ConditionalControllerProps<...>> is true).
 *
 * @example
 * Given the following controller definitions:
 * ```
 * const {recommendationEngineDefinition} = defineCommerceEngine({
 *  controllers: {
 *    popularViewed: defineRecommendations({
 *      options: {slotId: 'slot-id'}
 *    })
 *  }
 * });
 * ```
 *
 * The following code will not throw an error since the 'popularViewed' controller props are optional
 * ```
 * recommendationEngineDefinition.fetchStaticState({
 *  controllers: {
 *    popularViewed: {enabled: true, productId: 'some-product-id'} // This is optional
 *  }
 * })
 * ```
 *
 * The following code (with no arguments) is also valid because the 'popularViewed' controller props are optional, and there are no other required controller props in the engine definition.
 * ```
 * recommendationEngineDefinition.fetchStaticState()
 * ```
 */
type OptionalEngineDefinitionControllersPropsOption<
  TControllers extends ControllerDefinitionsMap<Controller>,
  TControllersPropsMap extends ControllersPropsMap,
  TSolutionType extends SolutionType,
> = {
  [K in keyof TControllers as HasKey<
    TControllers[K],
    TSolutionType
  > extends never
    ? never
    : HasOptionalKeys<
          ConditionalControllerProps<
            TControllers,
            TControllersPropsMap,
            TSolutionType,
            K
          >
        > extends false
      ? never
      : 'controllers']?: ConditionalControllerProps<
    TControllers,
    TControllersPropsMap,
    TSolutionType,
    K
  >;
};

/**
 * Represents a type that defines the required controller properties for engine definition controllers.
 *
 * @template TControllers - A map of controller definitions.
 * @template TControllersPropsMap - A map of controller properties.
 * @template TSolutionType - The type of solution being used.
 *
 * The type iterates over the controller keys (defined in the engine definition) and includes only those keys where:
 * 1. The controller can be used for a specific solution type (HasKey<TControllers[K], TSolutionType> is not 'never').
 * 2. The controller properties have required options (HasRequiredKeys<ConditionalControllerProps<...>> is true).
 *
 * The resulting type maps the valid keys to their corresponding conditional controller properties.
 *
 * @example
 * Given the following controller definitions:
 * ```
 * const {standaloneEngineDefinition} = defineCommerceEngine({
 *  controllers: {cart: defineCart()},
 * });
 * ```
 *
 * The following code will not throw an error since the 'cart' controller props are required for the standalone engine definition:
 * ```
 * standaloneEngineDefinition.fetchStaticState({
 *   controllers: {
 *     cart: {initialState: {items: []}},
 *   },
 * })
 * ```
 *
 */
type RequiredEngineDefinitionControllersPropsOption<
  TControllers extends ControllerDefinitionsMap<Controller>,
  TControllersPropsMap extends ControllersPropsMap,
  TSolutionType extends SolutionType,
> = {
  [K in keyof TControllers as HasKey<
    TControllers[K],
    TSolutionType
  > extends never
    ? never
    : HasRequiredKeys<
          ConditionalControllerProps<
            TControllers,
            TControllersPropsMap,
            TSolutionType,
            K
          >
        > extends false
      ? never
      : 'controllers']: ConditionalControllerProps<
    TControllers,
    TControllersPropsMap,
    TSolutionType,
    K
  >;
};

type IsRecommendationController<
  TController extends ControllerDefinition<Controller>,
> = HasKey<TController, typeof recommendationInternalOptionKey>;

/**
 * This type ensures that recommendation controller props are optional, while other controller props remain required.
 *
 * It works by checking if the controller definition includes the `recommendationInternalOptionKey`.
 *
 * - If the key is present, the controller props are made optional.
 * - If the key is absent, the controller props are required.
 *
 * Example:
 *
 * ```typescript
 * type ControllerProps = InferControllerPropsFromDefinition<{
 *   recommendation: defineRecommendation({}),
 *   cart: defineCart(),
 * }>;
 *
 * // In this example:
 * // - The `recommendation` controller props are optional.
 * // - The `cart` controller props are required.
 *
 * const props: ControllerProps = {
 *   cart: {initialState: {items: []}},
 *   // recommendation props can be omitted
 * };
 * ```
 */
type RecommendationControllerProps<
  TControllers extends ControllerDefinitionsMap<Controller>,
  TControllersPropsMap extends ControllersPropsMap,
  K extends keyof TControllers,
> = {
  [I in keyof TControllersPropsMap as I extends K
    ? IsRecommendationController<TControllers[I]> extends never
      ? never
      : I
    : never]?: TControllersPropsMap[I];
} & {
  [I in keyof TControllersPropsMap as I extends K
    ? IsRecommendationController<TControllers[I]> extends never
      ? I
      : never
    : never]: TControllersPropsMap[I];
};

type DefaultControllerProps<
  TControllers extends ControllerDefinitionsMap<Controller>,
  TControllersPropsMap extends ControllersPropsMap,
  K extends keyof TControllers,
> = {
  [I in keyof TControllersPropsMap as I extends K
    ? I
    : never]: TControllersPropsMap[I];
};

type ConditionalControllerProps<
  TControllers extends ControllerDefinitionsMap<Controller>,
  TControllersPropsMap extends ControllersPropsMap,
  TSolutionType extends SolutionType,
  K extends keyof TControllers,
> = TSolutionType extends SolutionType.recommendation
  ? RecommendationControllerProps<TControllers, TControllersPropsMap, K>
  : DefaultControllerProps<TControllers, TControllersPropsMap, K>;

export interface ControllerDefinitionOption {
  /**
   * Whether the controller will be used in a product listing context.
   * @defaultValue true
   */
  listing?: boolean;
  /**
   * Whether the controller will be used in a search page context.
   * @defaultValue true
   */
  search?: boolean;
}

export type SearchOnlyControllerDefinitionWithoutProps<
  TController extends Controller,
> = ControllerDefinitionWithoutProps<TController> & SearchOnlyController;

type SearchOnlyControllerDefinitionWithProps<
  TController extends Controller,
  TProps,
> = ControllerDefinitionWithProps<TController, TProps> & SearchOnlyController;

export type ListingAndStandaloneControllerWithoutProps<
  TController extends Controller,
> = ControllerDefinitionWithoutProps<TController> &
  ListingAndStandaloneController;

type ListingOnlyControllerDefinitionWithoutProps<
  TController extends Controller,
> = ControllerDefinitionWithoutProps<TController> & ListingOnlyController;

type ListingOnlyControllerDefinitionWithProps<
  TController extends Controller,
  TProps,
> = ControllerDefinitionWithProps<TController, TProps> & ListingOnlyController;

export type RecommendationOnlyControllerDefinitionWithProps<
  TController extends Controller,
  TProps,
> = ControllerDefinitionWithProps<TController, TProps> &
  RecommendationOnlyController;

export type NonRecommendationControllerDefinitionWithoutProps<
  TController extends Controller,
> = ControllerDefinitionWithoutProps<TController> & NonRecommendationController;

export type UniversalControllerDefinitionWithProps<
  TController extends Controller,
  TProps,
> = ControllerDefinitionWithProps<TController, TProps> & UniversalController;

export type SearchAndListingControllerDefinitionWithoutProps<
  TController extends Controller,
> = ControllerDefinitionWithoutProps<TController> & SearchAndListingController;

type SearchAndListingControllerDefinitionWithProps<
  TController extends Controller,
  TProps,
> = ControllerDefinitionWithProps<TController, TProps> &
  SearchAndListingController;

export type SubControllerDefinitionWithoutProps<
  TController extends Controller,
  TDefinition extends ControllerDefinitionOption | undefined,
> = TDefinition extends {listing?: true; search?: true} | undefined
  ? SearchAndListingControllerDefinitionWithoutProps<TController>
  : TDefinition extends {listing?: true; search?: false}
    ? ListingOnlyControllerDefinitionWithoutProps<TController>
    : TDefinition extends {listing?: false; search?: true}
      ? SearchOnlyControllerDefinitionWithoutProps<TController>
      : TDefinition extends {listing: false; search: false}
        ? InvalidControllerDefinition
        : never;

export type SubControllerDefinitionWithProps<
  TController extends Controller,
  TDefinition extends ControllerDefinitionOption | undefined,
  TProps,
> = TDefinition extends {listing?: true; search?: true} | undefined
  ? SearchAndListingControllerDefinitionWithProps<TController, TProps>
  : TDefinition extends {listing?: true; search?: false}
    ? ListingOnlyControllerDefinitionWithProps<TController, TProps>
    : TDefinition extends {listing?: false; search?: true}
      ? SearchOnlyControllerDefinitionWithProps<TController, TProps>
      : TDefinition extends {listing: false; search: false}
        ? InvalidControllerDefinition
        : never;
