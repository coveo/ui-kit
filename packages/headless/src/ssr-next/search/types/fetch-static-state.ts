import type {UnknownAction} from '@reduxjs/toolkit';
import type {InferControllerStaticStateMapFromControllers} from '../../common/types/controller-inference.js';
import type {ControllerStaticStateMap} from '../../common/types/controllers.js';
import type {EngineStaticState} from '../../common/types/engine.js';
import type {BuildConfig} from './build.js';
import type {BakedInSearchControllers} from './controller-definition.js';

/**
 * The serializable snapshot returned by `fetchStaticState()`.
 *
 * It carries the state of every controller, the actions to replay, and the page facts that produced
 * it (navigator context, search parameters, custom context, per-request access token), so that it
 * can be passed as is to `hydrateStaticState()`.
 */
export type SearchStaticState<
  TSearchAction extends UnknownAction,
  TControllersStaticState extends ControllerStaticStateMap,
> = EngineStaticState<
  TSearchAction,
  TControllersStaticState & InferControllerStaticStateMapFromControllers<BakedInSearchControllers>
> &
  BuildConfig;

/**
 * Executes only the initial search for a given configuration, then returns a resumable snapshot of engine state along with the state of the controllers.
 *
 * Useful for static generation and server-side rendering.
 */
export type FetchStaticState<
  TSearchAction extends UnknownAction,
  TControllersStaticState extends ControllerStaticStateMap,
> = (params: BuildConfig) => Promise<SearchStaticState<TSearchAction, TControllersStaticState>>;
