import type {UnknownAction} from '@reduxjs/toolkit';
import type {
  ControllersMap,
  ControllersPropsMap,
  HydratedState,
  OptionsTuple,
} from '../../ssr-engine/types/common.js';
import {SSRCommerceEngine} from '../factories/build-factory.js';
import {EngineDefinitionControllersPropsOption} from './common.js';
import {FromBuildResult} from './from-build-result.js';

export interface HydrateStaticStateOptions<TSearchAction> {
  searchActions: TSearchAction[];
}

export type HydrateStaticState<
  TControllers extends ControllersMap,
  TSearchAction extends UnknownAction,
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
  ): Promise<HydratedState<SSRCommerceEngine, TControllers>>;

  fromBuildResult: FromBuildResult<
    TControllers,
    HydrateStaticStateOptions<TSearchAction>,
    HydratedState<SSRCommerceEngine, TControllers>
  >;
};
