import type {UnknownAction} from '@reduxjs/toolkit';
import type {InferControllerStaticStateMapFromControllers} from '../../common/types/controller-inference.js';
import type {
  ControllerStaticStateMap,
  ControllersPropsMap,
} from '../../common/types/controllers.js';
import type {EngineStaticState} from '../../common/types/engine.js';
import type {BuildConfig} from './build.js';
import type {BakedInSearchControllers} from './controller-definition.js';
import type {SearchEngineDefinitionControllersPropsOption} from './engine.js';

/**
 * The serializable snapshot returned by `fetchStaticState()`.
 *
 * It carries the state of every controller, the actions to replay, and the build configuration
 * that produced it (navigator context, search parameters, per-request access token), so that it
 * can be passed as is to `hydrateStaticState()`.
 */
export type SearchStaticState<
  TSearchAction extends UnknownAction,
  TControllersStaticState extends ControllerStaticStateMap,
> = EngineStaticState<
  TSearchAction,
  TControllersStaticState & InferControllerStaticStateMapFromControllers<BakedInSearchControllers>
> &
  BuildConfig & {
    /**
     * The controller props that were passed to `fetchStaticState()` through the `controllers` option.
     * `hydrateStaticState()` reuses them to rebuild the controllers with the same props.
     */
    controllerProps?: ControllersPropsMap;
  };

/**
 * Executes only the initial search for a given configuration, then returns a resumable snapshot of engine state along with the state of the controllers.
 *
 * Useful for static generation and server-side rendering.
 */
export type FetchStaticState<
  TSearchAction extends UnknownAction,
  TControllersStaticState extends ControllerStaticStateMap,
  TControllersProps extends ControllersPropsMap,
> = (
  params: BuildConfig & SearchEngineDefinitionControllersPropsOption<TControllersProps>
) => Promise<SearchStaticState<TSearchAction, TControllersStaticState>>;
