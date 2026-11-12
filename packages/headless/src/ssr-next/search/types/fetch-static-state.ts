import type {ControllerStaticState} from '../../common/types/controllers.js';
import type {EngineStaticState} from '../../common/types/engine.js';
import type {BuildConfig} from './build.js';
import type {AugmentedControllerDefinition} from './controller-definition.js';
import type {InferControllerFromDefinition} from './controller-inference.js';
import type {SearchControllerDefinitionsMap} from './engine.js';

/**
 * The serializable snapshot returned by `fetchStaticState()`.
 *
 * It carries the state of every controller, the actions to replay, and the page facts that produced
 * it (navigator context, search parameters, custom context, per-request access token), so that it
 * can be passed as is to `hydrateStaticState()`.
 *
 * Its `controllers` hold the state of the controllers of the engine definition and of the baked-in
 * ones (`parameterManager` and `context`).
 *
 * @typeParam TControllers - The controllers of the engine definition.
 */
export type SearchStaticState<TControllers extends SearchControllerDefinitionsMap> =
  EngineStaticState<{
    [K in keyof AugmentedControllerDefinition<TControllers>]: ControllerStaticState<
      InferControllerFromDefinition<AugmentedControllerDefinition<TControllers>[K]>['state']
    >;
  }> &
    BuildConfig;
