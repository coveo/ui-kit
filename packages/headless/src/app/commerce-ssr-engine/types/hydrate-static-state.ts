import type {UnknownAction} from '@reduxjs/toolkit';
import {Controller} from '../../../controllers/controller/headless-controller.js';
import type {
  ControllersMap,
  ControllersPropsMap,
  HydratedState,
  OptionsTuple,
} from '../../ssr-engine/types/common.js';
import {SSRCommerceEngine} from '../factories/build-factory.js';
import {
  ControllerDefinitionsMap,
  EngineDefinitionControllersPropsOption,
  SolutionType,
} from './common.js';
import {FromBuildResult} from './from-build-result.js';

export interface HydrateStaticStateOptions<TSearchAction> {
  searchActions: TSearchAction[];
}

export type HydrateStaticState<
  TControllers extends ControllersMap,
  TSearchAction extends UnknownAction,
  TControllersProps extends ControllersPropsMap,
  TControllersDefinitionsMap extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
> = {
  /**
   * Creates a new engine from the snapshot of the engine created in SSR with fetchStaticState.
   *
   * Useful when hydrating a server-side-rendered engine.
   */
  (
    ...params: OptionsTuple<
      HydrateStaticStateOptions<TSearchAction> &
        EngineDefinitionControllersPropsOption<
          TControllersDefinitionsMap,
          TControllersProps,
          TSolutionType
        >
    >
  ): Promise<HydratedState<SSRCommerceEngine, TControllers>>;

  fromBuildResult: FromBuildResult<
    TControllers,
    HydrateStaticStateOptions<TSearchAction>,
    HydratedState<SSRCommerceEngine, TControllers>
  >;
};
