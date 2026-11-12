import type {Controller} from '../../../controllers/controller/headless-controller.js';
import type {ControllerStaticState} from '../../common/types/controllers.js';
import type {EngineStaticState} from '../../common/types/engine.js';
import type {HasKey} from '../../common/types/utilities.js';
import type {BuildConfig} from './build.js';
import type {SolutionType} from './controller-constants.js';
import type {
  AugmentedControllerDefinition,
  ControllerDefinitionsMap,
} from './controller-definitions.js';
import type {InferControllerFromDefinition} from './controller-inference.js';

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
export type CommerceStaticState<
  TControllers extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
> = EngineStaticState<{
  [
    K in keyof AugmentedControllerDefinition<TControllers> as HasKey<
      AugmentedControllerDefinition<TControllers>[K],
      TSolutionType
    > extends never
      ? never
      : K
  ]: ControllerStaticState<
    InferControllerFromDefinition<AugmentedControllerDefinition<TControllers>[K]>['state']
  >;
}> &
  BuildConfig<TControllers, TSolutionType> & {
    /**
     * The solution type of the engine definition that fetched the static state. `hydrateStaticState()`
     * refuses a static state fetched by another engine definition.
     */
    solutionType: TSolutionType;
  };
