import type {UnknownAction} from '@reduxjs/toolkit';
import type {CoreEngine, CoreEngineNext} from '../../../app/engine.js';
import type {ControllerStaticStateMap, ControllersMap} from '../../common/types/controllers.js';
import type {BakedInSearchControllers} from './controller-definition.js';
import type {SearchEngineDefinitionBuildResult} from './engine.js';
import type {SearchStaticState} from './fetch-static-state.js';

/**
 * The engine and the live controllers returned by `hydrateStaticState()`, including the baked-in
 * `parameterManager` controller.
 */
export type HydratedState<
  TEngine extends CoreEngine | CoreEngineNext,
  TControllers extends ControllersMap,
> = SearchEngineDefinitionBuildResult<TEngine, TControllers & BakedInSearchControllers>;

/**
 * Creates a new engine from the snapshot of the engine created in SSR with fetchStaticState.
 *
 * Useful when hydrating a server-side-rendered engine.
 */
export type HydrateStaticState<
  TEngine extends CoreEngine | CoreEngineNext,
  TControllers extends ControllersMap,
  TSearchAction extends UnknownAction,
  TControllersStaticState extends ControllerStaticStateMap,
> = (
  staticState: SearchStaticState<TSearchAction, TControllersStaticState>
) => Promise<HydratedState<TEngine, TControllers>>;
