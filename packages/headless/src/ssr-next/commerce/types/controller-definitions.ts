import type {Controller} from '../../../controllers/controller/headless-controller.js';
import type {
  InferControllerStaticStateFromController,
  InferControllerStaticStateMapFromControllers,
} from '../../common/types/controller-inference.js';
import type {ControllersPropsMap} from '../../common/types/controllers.js';
import type {HasKey, HasRequiredKeys} from '../../common/types/utilities.js';
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
  NonRecommendationController,
  RecommendationOnlyController,
  SearchAndListingController,
  SearchOnlyController,
  UniversalController,
} from './controller-scopes.js';
import type {HydratedState} from './hydrate-static-state.js';
import type {HasSolutionType} from './utilities.js';

export type {
  HydratedState,
  InferControllerStaticStateFromController,
  InferControllerStaticStateMapFromControllers,
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
  ): TController;
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
  parameterManager: ParameterManagerDefinition;
  context: ContextDefinition;
  cart: CartDefinition;
};

/**
 * Map of baked-in controllers
 */
export type BakedInControllers = {
  [K in keyof BakedInControllerDefinitions]: ReturnType<
    BakedInControllerDefinitions[K]['buildWithProps']
  >;
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
 * This type defines the required and optional controller props for the commerce engine definition.
 */
export type CommerceEngineDefinitionControllersPropsOption<
  TControllers extends ControllerDefinitionsMap<Controller>,
  TControllersPropsMap extends ControllersPropsMap,
  TSolutionType extends SolutionType,
> = RequiredEngineDefinitionControllersPropsOption<
  TControllers,
  TControllersPropsMap,
  TSolutionType
>;

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
    : IsRecommendationController<TControllers[K]> extends never
      ? HasRequiredKeys<
          DefaultControllerProps<TControllers, TControllersPropsMap, K>
        > extends false
        ? never
        : 'controllers'
      : never]: DefaultControllerProps<TControllers, TControllersPropsMap, K>;
};

export type IsRecommendationController<
  TController extends ControllerDefinition<Controller>,
> = HasKey<TController, typeof recommendationInternalOptionKey>;

type DefaultControllerProps<
  TControllers extends ControllerDefinitionsMap<Controller>,
  TControllersPropsMap extends ControllersPropsMap,
  K extends keyof TControllers,
> = {
  [I in keyof TControllersPropsMap as I extends K
    ? I
    : never]: TControllersPropsMap[I];
};

export type SearchOnlyControllerDefinitionWithoutProps<
  TController extends Controller,
> = ControllerDefinitionWithoutProps<TController> & SearchOnlyController;

export type ListingAndStandaloneControllerWithoutProps<
  TController extends Controller,
> = ControllerDefinitionWithoutProps<TController> &
  ListingAndStandaloneController;

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

export type SearchAndListingControllerDefinitionWithProps<
  TController extends Controller,
  TProps,
> = ControllerDefinitionWithProps<TController, TProps> &
  SearchAndListingController;
