import {AnyAction} from '@reduxjs/toolkit';
import {CoreEngine} from '../../engine';
import {
  ControllersMap,
  ControllersPropsMap,
  EngineDefinitionControllersPropsOption,
  HydratedState,
  OptionsTuple,
} from './common';

export interface HydrateStaticStateOptions<TSearchAction> {
  searchAction: TSearchAction;
}

export type HydrateStaticState<
  TEngine extends CoreEngine,
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
};
