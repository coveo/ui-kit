import type {UnknownAction} from '@reduxjs/toolkit';
import type {CoreEngine, CoreEngineNext} from '../../engine.js';
import type {
  ControllersMap,
  ControllersPropsMap,
  HydratedState,
  OptionsTuple,
} from '../../ssr-engine/types/common.js';
import {
  EngineDefinitionControllersPropsOption,
  SolutionType,
} from './common.js';
import {FromBuildResult} from './from-build-result.js';

export interface HydrateStaticStateOptions<TSearchAction> {
  searchActions: TSearchAction[];
}

export type HydrateStaticState<
  TEngine extends CoreEngine | CoreEngineNext,
  TControllers extends ControllersMap,
  TSearchAction extends UnknownAction,
  TControllersProps extends ControllersPropsMap,
  TSolutionType extends SolutionType,
> = TSolutionType extends SolutionType.recommendation
  ? {
      /**
       * Creates a new engine from the snapshot of the engine created in SSR with fetchStaticState.
       *
       * Useful when hydrating a server-side-rendered engine.
       */
      (
        ...params: OptionsTuple<HydrateStaticStateOptions<TSearchAction>>
      ): Promise<HydratedState<TEngine, TControllers>>;

      fromBuildResult: FromBuildResult<
        TEngine,
        TControllers,
        HydrateStaticStateOptions<TSearchAction>,
        HydratedState<TEngine, TControllers>
      >;
    }
  : {
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
