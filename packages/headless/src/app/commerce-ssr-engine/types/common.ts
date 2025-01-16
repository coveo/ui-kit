import {UnknownAction} from '@reduxjs/toolkit';
import type {Controller} from '../../../controllers/controller/headless-controller.js';
import type {InvalidControllerDefinition} from '../../../utils/errors.js';
import type {
  HasKey,
  InferControllerStaticStateMapFromControllers,
  InferControllerStaticStateFromController,
  ControllerStaticStateMap,
  EngineDefinitionBuildResult,
  HydratedState,
  OptionsTuple,
  ControllersPropsMap,
  HasKeys,
  HasRequiredKeys,
  HasOptionalKeys,
} from '../../ssr-engine/types/common.js';
import {SSRCommerceEngine} from '../factories/build-factory.js';
import {Kind} from './kind.js';

export type {
  EngineDefinitionBuildResult,
  HydratedState,
  OptionsTuple,
  InferControllerStaticStateFromController,
  InferControllerStaticStateMapFromControllers,
};

export enum SolutionType {
  search = 'search',
  listing = 'listing',
  standalone = 'standalone',
  recommendation = 'recommendation',
}

const recommendationOptionKey = 'recommendation-internal-options';
export const recommendationInternalOptionKey = Symbol.for(
  recommendationOptionKey
);

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

export interface EngineStaticState<
  TSearchAction extends UnknownAction,
  TControllers extends ControllerStaticStateMap,
> {
  searchActions: TSearchAction[];
  controllers: TControllers;
}

export interface SolutionTypeAvailability {
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

export type InferControllerPropsFromDefinition<
  TController extends ControllerDefinition<Controller>,
> =
  TController extends ControllerDefinitionWithProps<Controller, infer Props>
    ? HasKey<TController, typeof recommendationInternalOptionKey> extends never
      ? Props
      : Props & RecommendationControllerSettings
    : TController extends ControllerDefinitionWithoutProps<Controller>
      ? HasKey<
          TController,
          typeof recommendationInternalOptionKey
        > extends never
        ? {}
        : RecommendationControllerSettings
      : unknown;

export type InferControllerPropsMapFromDefinitions<
  TControllers extends ControllerDefinitionsMap<Controller>,
> = {
  [K in keyof TControllers as HasKeys<
    InferControllerPropsFromDefinition<TControllers[K]>
  > extends false
    ? never
    : K]: InferControllerPropsFromDefinition<TControllers[K]>;
};

export type InferControllerFromDefinition<
  TDefinition extends ControllerDefinition<Controller>,
> =
  TDefinition extends ControllerDefinition<infer TController>
    ? TController
    : never;

export type InferControllersMapFromDefinition<
  TControllers extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
> = {
  [K in keyof TControllers as HasKey<
    TControllers[K],
    TSolutionType
  > extends never
    ? never
    : K]: InferControllerFromDefinition<TControllers[K]>;
};

export type InferControllerStaticStateMapFromDefinitionsWithSolutionType<
  TControllers extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
> = {
  [K in keyof TControllers as HasKey<
    TControllers[K],
    TSolutionType
  > extends never
    ? never
    : K]: InferControllerStaticStateFromController<
    InferControllerFromDefinition<TControllers[K]>
  >;
};

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
export type OptionalEngineDefinitionControllersPropsOption<
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
export type RequiredEngineDefinitionControllersPropsOption<
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

interface NonRecommendationController {
  /**
   * @internal
   */
  [SolutionType.search]: true;
  /**
   * @internal
   */
  [SolutionType.listing]: true;
  /**
   * @internal
   */
  [SolutionType.standalone]: true;
}

interface UniversalController {
  /**
   * @internal
   */
  [SolutionType.search]: true;
  /**
   * @internal
   */
  [SolutionType.listing]: true;
  /**
   * @internal
   */
  [SolutionType.standalone]: true;
  /**
   * @internal
   */
  [SolutionType.recommendation]: true;
}

interface SearchOnlyController {
  /**
   * @internal
   */
  [SolutionType.search]: true;
}

interface ListingOnlyController {
  /**
   * @internal
   */
  [SolutionType.listing]: true;
}

interface RecommendationOnlyController {
  /**
   * @internal
   */
  [SolutionType.recommendation]: true;
}

interface SearchAndListingController {
  /**
   * @internal
   */
  [SolutionType.search]: true;
  /**
   * @internal
   */
  [SolutionType.listing]: true;
}

interface ListingAndStandaloneController {
  /**
   * @internal
   */
  [SolutionType.listing]: true;
  /**
   * @internal
   */
  [SolutionType.standalone]: true;
}

export type SearchOnlyControllerDefinitionWithoutProps<
  TController extends Controller,
> = ControllerDefinitionWithoutProps<TController> & SearchOnlyController;

export type SearchOnlyControllerDefinitionWithProps<
  TController extends Controller,
  TProps,
> = ControllerDefinitionWithProps<TController, TProps> & SearchOnlyController;

export type ListingAndStandaloneControllerWithoutProps<
  TController extends Controller,
> = ControllerDefinitionWithoutProps<TController> &
  ListingAndStandaloneController;

export type ListingOnlyControllerDefinitionWithoutProps<
  TController extends Controller,
> = ControllerDefinitionWithoutProps<TController> & ListingOnlyController;

export type ListingOnlyControllerDefinitionWithProps<
  TController extends Controller,
  TProps,
> = ControllerDefinitionWithProps<TController, TProps> & ListingOnlyController;

export type RecommendationOnlyControllerDefinitionWithoutProps<
  TController extends Controller,
> = ControllerDefinitionWithoutProps<TController> &
  RecommendationOnlyController;

export type RecommendationOnlyControllerDefinitionWithProps<
  TController extends Controller,
  TProps,
> = ControllerDefinitionWithProps<TController, TProps> &
  RecommendationOnlyController;

export type NonRecommendationControllerDefinitionWithoutProps<
  TController extends Controller,
> = ControllerDefinitionWithoutProps<TController> & NonRecommendationController;

export type NonRecommendationControllerDefinitionWithProps<
  TController extends Controller,
  TProps,
> = ControllerDefinitionWithProps<TController, TProps> &
  NonRecommendationController;

export type UniversalControllerDefinitionWithoutProps<
  TController extends Controller,
> = ControllerDefinitionWithoutProps<TController> & UniversalController;

export type UniversalControllerDefinitionWithProps<
  TController extends Controller,
  TProps,
> = ControllerDefinitionWithProps<TController, TProps> & UniversalController;

export type SearchAndListingControllerDefinitionWithoutProps<
  TController extends Controller,
> = ControllerDefinitionWithoutProps<TController> & SearchAndListingController;

export type SearchAndListingControllerDefinitionWithProps<
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
