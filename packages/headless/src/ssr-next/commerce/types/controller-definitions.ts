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
import type {CommerceEngineDefinitionBuildResult} from './engine.js';
import type {Kind} from './kind.js';

export type {
  CommerceEngineDefinitionBuildResult,
  HydratedState,
  OptionsTuple,
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

// TODO: KIT-4742: There is no point for this interface now that the wiring is happening in headless
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

export type AugmentedControllerDefinition<
  TControllerDefinitions extends ControllerDefinitionsMap<Controller>,
> = TControllerDefinitions & {
  parameterManager: ParameterManagerDefinition<{listing: true; search: true}>; // TODO: KIT-4611: stop exposing this TOption param
  context: ContextDefinition;
  cart: CartDefinition;
};

/**
 * This type defines the required and optional controller props for the engine definition.
 */
export type EngineDefinitionControllersPropsOption<
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
