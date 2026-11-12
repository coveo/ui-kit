import type {Controller} from '../../../controllers/controller/headless-controller.js';
import type {
  InferControllerStaticStateFromController,
  InferControllerStaticStateMapFromControllers,
} from '../../common/types/controller-inference.js';
import type {HasKey} from '../../common/types/utilities.js';
import type {CartDefinition} from '../controllers/cart/headless-cart.ssr.js';
import type {ContextDefinition} from '../controllers/context/headless-context.ssr.js';
import type {ParameterManagerDefinition} from '../controllers/parameter-manager/headless-core-parameter-manager.ssr.js';
import type {SSRCommerceEngine} from '../factories/build-factory.js';
import type {ControllerBuildContext} from './build.js';
import {type recommendationInternalOptionKey, SolutionType} from './controller-constants.js';
import type {
  ListingAndStandaloneController,
  SearchAndListingController,
  SearchOnlyController,
  StandaloneController,
  UniversalController,
} from './controller-scopes.js';

export type {
  InferControllerStaticStateFromController,
  InferControllerStaticStateMapFromControllers,
};

interface SolutionTypeAvailability {
  [SolutionType.search]?: boolean;
  [SolutionType.listing]?: boolean;
  [SolutionType.standalone]?: boolean;
}

/**
 * The definition of a controller: how to build it for a request. The kinds of page it is built for are
 * the solution-type flags set next to it by the definer.
 */
export interface ControllerDefinition<TController extends Controller> {
  /**
   * Creates an instance of the controller.
   *
   * @param engine - The engine of the request.
   * @param context - The kind of page the controller is built for, and the page facts passed to
   *  `fetchStaticState()`.
   * @returns The created controller instance.
   */
  build(engine: SSRCommerceEngine, context: ControllerBuildContext): TController;
}

export interface ControllerDefinitionsMap<TController extends Controller> {
  [customName: string]: ControllerDefinition<TController> & SolutionTypeAvailability;
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
  [K in keyof BakedInControllerDefinitions]: ReturnType<BakedInControllerDefinitions[K]['build']>;
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

export type IsRecommendationController<TController extends ControllerDefinition<Controller>> =
  HasKey<TController, typeof recommendationInternalOptionKey>;

export type SearchOnlyControllerDefinition<TController extends Controller> =
  ControllerDefinition<TController> & SearchOnlyController;

export type ListingAndStandaloneControllerDefinition<TController extends Controller> =
  ControllerDefinition<TController> & ListingAndStandaloneController;

export type UniversalControllerDefinition<TController extends Controller> =
  ControllerDefinition<TController> & UniversalController;

export type SearchAndListingControllerDefinition<TController extends Controller> =
  ControllerDefinition<TController> & SearchAndListingController;

export type StandaloneControllerDefinition<TController extends Controller> =
  ControllerDefinition<TController> & StandaloneController;
