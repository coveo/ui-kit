import type {UnknownAction} from '@reduxjs/toolkit';
import type {CoreEngine, CoreEngineNext} from '../../../app/engine.js';
import type {
  ControllersMap,
  ControllersPropsMap,
} from '../../common/types/controllers.js';
import type {BuildConfig} from './build.js';
import type {
  SearchEngineDefinitionBuildResult,
  SearchEngineDefinitionControllersPropsOption,
} from './engine.js';

export type HydratedState<
  TEngine extends CoreEngine | CoreEngineNext,
  TControllers extends ControllersMap,
> = SearchEngineDefinitionBuildResult<TEngine, TControllers>;

interface HydrateStaticStateOptions<TSearchAction> {
  searchActions: TSearchAction[];
}

/**
 * Creates a new engine from the snapshot of the engine created in SSR with fetchStaticState.
 *
 * Useful when hydrating a server-side-rendered engine.
 */
export type HydrateStaticState<
  TEngine extends CoreEngine | CoreEngineNext,
  TControllers extends ControllersMap,
  TSearchAction extends UnknownAction,
  TControllersProps extends ControllersPropsMap,
> = (
  params: BuildConfig &
    HydrateStaticStateOptions<TSearchAction> &
    SearchEngineDefinitionControllersPropsOption<TControllersProps>
) => Promise<HydratedState<TEngine, TControllers>>;
