import type {UnknownAction} from '@reduxjs/toolkit';
import type {Controller} from '../../../controllers/controller/headless-controller.js';
import type {InferControllerStaticStateMapFromControllers} from '../../common/types/controller-inference.js';
import type {ControllerStaticStateMap} from '../../common/types/controllers.js';
import type {EngineStaticState} from '../../common/types/engine.js';
import type {BuildConfig} from './build.js';
import type {SolutionType} from './controller-constants.js';
import type {
  ControllerDefinitionsMap,
  FilteredBakedInControllers,
} from './controller-definitions.js';

/**
 * The serializable snapshot returned by `fetchStaticState()`.
 *
 * It carries the state of every controller, the actions to replay, and the page facts that produced
 * it (navigator context, context, cart, search parameters, product, requested recommendation slots,
 * per-request access token), so that it can be passed as is to `hydrateStaticState()`.
 */
export type CommerceStaticState<
  TSearchAction extends UnknownAction,
  TControllersStaticState extends ControllerStaticStateMap,
  TControllersDefinitionsMap extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
> = EngineStaticState<
  TSearchAction,
  TControllersStaticState &
    InferControllerStaticStateMapFromControllers<FilteredBakedInControllers<TSolutionType>>
> &
  BuildConfig<TControllersDefinitionsMap, TSolutionType> & {
    /**
     * The solution type of the engine definition that fetched the static state. `hydrateStaticState()`
     * refuses a static state fetched by another engine definition.
     */
    solutionType: TSolutionType;
  };

/**
 * Executes only the initial search for a given configuration, then returns a resumable snapshot of engine state along with the state of the controllers.
 *
 * Useful for static generation and server-side rendering.
 */
export type FetchStaticState<
  TSearchAction extends UnknownAction,
  TControllersStaticState extends ControllerStaticStateMap,
  TControllersDefinitionsMap extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
> = (
  params: BuildConfig<TControllersDefinitionsMap, TSolutionType>
) => Promise<
  CommerceStaticState<
    TSearchAction,
    TControllersStaticState,
    TControllersDefinitionsMap,
    TSolutionType
  >
>;
