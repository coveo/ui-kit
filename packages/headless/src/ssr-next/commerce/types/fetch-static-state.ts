import type {UnknownAction} from '@reduxjs/toolkit';
import type {Controller} from '../../../controllers/controller/headless-controller.js';
import type {ControllerStaticState, ControllersPropsMap} from '../../common/types/controllers.js';
import type {EngineStaticState} from '../../common/types/engine.js';
import type {HasKey} from '../../common/types/utilities.js';
import type {BuildConfig} from './build.js';
import type {SolutionType} from './controller-constants.js';
import type {
  BakedInControllerDefinitions,
  BakedInControllers,
  ControllerDefinitionsMap,
} from './controller-definitions.js';
import type {
  InferControllerFromDefinition,
  InferControllerPropsFromDefinition,
} from './controller-inference.js';

/**
 * The serializable snapshot returned by `fetchStaticState()`.
 *
 * It carries the state of every controller, the actions to replay, and the build configuration
 * that produced it (navigator context, context, cart, search parameters, per-request access token),
 * so that it can be passed as is to `hydrateStaticState()`.
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
> = EngineStaticState<
  UnknownAction,
  {
    [
      K in keyof TControllers as HasKey<TControllers[K], TSolutionType> extends never ? never : K
    ]: ControllerStaticState<InferControllerFromDefinition<TControllers[K]>['state']> &
      InferControllerPropsFromDefinition<TControllers[K]>;
  } & {
    [
      K in keyof BakedInControllers as HasKey<
        BakedInControllerDefinitions[K],
        TSolutionType
      > extends never
        ? never
        : K
    ]: ControllerStaticState<BakedInControllers[K]['state']>;
  }
> &
  BuildConfig<TControllers, TSolutionType> & {
    /**
     * The controller props that were passed to `fetchStaticState()` through the `controllers` option.
     * `hydrateStaticState()` reuses them to rebuild the controllers with the same props.
     */
    controllerProps?: ControllersPropsMap;
  };
