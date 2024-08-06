import {AnyAction} from '@reduxjs/toolkit';
import {CoreEngine, CoreEngineNext} from '../../engine';
import {
  ControllersMap,
  ControllersPropsMap,
  EngineDefinitionControllersPropsOption,
  HydratedState,
  OptionsTuple,
} from './common';
import {FromBuildResult} from './from-build-result';

export interface HydrateStaticStateOptions<TSearchAction> {
  searchActions: TSearchAction[];
}

export type HydrateStaticState<
  TEngine extends CoreEngine | CoreEngineNext,
  TControllers extends ControllersMap,
  TSearchAction extends AnyAction,
  TControllersProps extends ControllersPropsMap,
> = {
  /**
   * Creates a new engine from the snapshot of the engine created in SSR with fetchStaticState.
   *
   * Useful when hydrating a server-side-rendered engine.
   */
  (
    ...params: OptionsTuple<
      HydrateStaticStateOptions<TSearchAction> &
        EngineDefinitionControllersPropsOption<TControllersProps>
    >
  ): Promise<HydratedState<TEngine, TControllers>>;

  fromBuildResult: FromBuildResult<
    TEngine,
    TControllers,
    HydrateStaticStateOptions<TSearchAction>,
    HydratedState<TEngine, TControllers>
  >;
};
