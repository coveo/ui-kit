import type {Controller} from '../../../controllers/controller/headless-controller.js';
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

interface SolutionTypeAvailability {
  [SolutionType.search]?: boolean;
  [SolutionType.listing]?: boolean;
  [SolutionType.standalone]?: boolean;
}

/**
 * A controller definition without its solution-type flags. The definition types of the definers add
 * the flags of their kinds of page to it, so that the engine definitions list exactly those.
 */
interface UnscopedControllerDefinition<TController extends Controller> {
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

/**
 * The definition of a controller: how to build it for a request, and the kinds of page it is built
 * for. An engine definition builds the controller only when its solution-type flag is `true`, so a
 * hand-written definition sets the flag of each kind of page it serves, such as `listing: true`.
 */
export interface ControllerDefinition<TController extends Controller>
  extends UnscopedControllerDefinition<TController>, SolutionTypeAvailability {}

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
  UnscopedControllerDefinition<TController> & SearchOnlyController;

export type ListingAndStandaloneControllerDefinition<TController extends Controller> =
  UnscopedControllerDefinition<TController> & ListingAndStandaloneController;

export type UniversalControllerDefinition<TController extends Controller> =
  UnscopedControllerDefinition<TController> & UniversalController;

export type SearchAndListingControllerDefinition<TController extends Controller> =
  UnscopedControllerDefinition<TController> & SearchAndListingController;

export type StandaloneControllerDefinition<TController extends Controller> =
  UnscopedControllerDefinition<TController> & StandaloneController;
