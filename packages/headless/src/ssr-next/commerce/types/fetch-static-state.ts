import type {Controller} from '../../../controllers/controller/headless-controller.js';
import type {ControllerStaticState} from '../../common/types/controllers.js';
import type {EngineStaticState} from '../../common/types/engine.js';
import type {ContextOptions} from '../controllers/context/headless-context.ssr.js';
import type {BuildConfig, CommonBuildConfig} from './build.js';
import type {SolutionType} from './controller-constants.js';
import type {BakedInControllers, ControllerDefinitionsMap} from './controller-definitions.js';
import type {
  AvailableControllerNames,
  BakedInControllerNames,
  InferControllerFromDefinition,
} from './controller-inference.js';

/**
 * The serializable snapshot returned by `fetchStaticState()`.
 *
 * It carries the state of every controller, the actions to replay, and the page facts that produced
 * it (navigator context, context, cart, search parameters, product, requested recommendation slots,
 * per-request access token), so that it can be passed as is to `hydrateStaticState()`.
 *
 * Its `controllers` hold the state of the controllers of the engine definition that are available to
 * the solution type, and of the baked-in ones (`context` and `cart` everywhere, `parameterManager`
 * for search and listing).
 *
 * @typeParam TControllers - The controllers of the engine definition.
 * @typeParam TSolutionType - The kind of page the engine definition serves.
 */
export interface CommerceStaticState<
  TControllers extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
>
  extends
    EngineStaticState<
      {
        [K in AvailableControllerNames<TControllers, TSolutionType>]: ControllerStaticState<
          InferControllerFromDefinition<TControllers[K & keyof TControllers]>['state']
        >;
      } & {
        [K in BakedInControllerNames<TSolutionType>]: ControllerStaticState<
          BakedInControllers[K]['state']
        >;
      }
    >,
    CommonBuildConfig<TControllers> {
  // Left undocumented so that editors show the documentation of `CommonBuildConfig.searchParams`.
  // `Exclude` keeps the interface extending `CommonBuildConfig` under `exactOptionalPropertyTypes`.
  searchParams?: Exclude<BuildConfig<TControllers, TSolutionType>['searchParams'], undefined>;
  /**
   * The solution type of the engine definition that fetched the static state. `hydrateStaticState()`
   * refuses a static state fetched by another engine definition.
   */
  solutionType: TSolutionType;
  /**
   * The commerce context of the request. `fetchStaticState()` always sets the URL of the page
   * (`view.url`), taken from `navigatorContext.location` when it was left out.
   */
  context: ContextOptions;
}
