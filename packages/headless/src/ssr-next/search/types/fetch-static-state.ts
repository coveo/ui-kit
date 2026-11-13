import type {ControllerStaticState, ControllersPropsMap} from '../../common/types/controllers.js';
import type {EngineStaticState} from '../../common/types/engine.js';
import type {BuildConfig} from './build.js';
import type {BakedInSearchControllers} from './controller-definition.js';
import type {
  InferControllerFromDefinition,
  InferControllerPropsFromDefinition,
} from './controller-inference.js';
import type {SearchControllerDefinitionsMap} from './engine.js';

/**
 * The serializable snapshot returned by `fetchStaticState()`.
 *
 * It carries the state of every controller, the actions to replay, and the build configuration
 * that produced it (navigator context, search parameters, per-request access token), so that it
 * can be passed as is to `hydrateStaticState()`.
 *
 * Its `controllers` hold the state of the controllers of the engine definition and of the baked-in
 * `parameterManager`.
 *
 * @typeParam TControllers - The controllers of the engine definition.
 */
export type SearchStaticState<TControllers extends SearchControllerDefinitionsMap> =
  EngineStaticState<
    {
      [K in keyof TControllers]: ControllerStaticState<
        InferControllerFromDefinition<TControllers[K]>['state']
      > &
        InferControllerPropsFromDefinition<TControllers[K]>;
    } & {
      [K in keyof BakedInSearchControllers]: ControllerStaticState<
        BakedInSearchControllers[K]['state']
      >;
    }
  > &
    BuildConfig & {
      /**
       * The controller props that were passed to `fetchStaticState()` through the `controllers` option.
       * `hydrateStaticState()` reuses them to rebuild the controllers with the same props.
       */
      controllerProps?: ControllersPropsMap;
    };
