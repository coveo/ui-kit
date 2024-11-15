import type {UnknownAction} from '@reduxjs/toolkit';
import {buildBaseCommerceAPIRequest} from '../../../features/commerce/common/actions.js';
import {SolutionType} from '../../commerce-ssr-engine/types/common.js';
import type {EngineStaticState} from '../../commerce-ssr-engine/types/common.js';
import type {CoreEngine, CoreEngineNext} from '../../engine.js';
import type {
  ControllersMap,
  ControllersPropsMap,
  ControllerStaticStateMap,
  EngineDefinitionControllersPropsOption,
  OptionsTuple,
} from '../../ssr-engine/types/common.js';
import type {FromBuildResult} from '../../ssr-engine/types/from-build-result.js';

export type FetchStaticStateOptions = {};

export type FetchStaticState<
  TEngine extends CoreEngine | CoreEngineNext,
  TControllers extends ControllersMap,
  TSearchAction extends UnknownAction,
  TControllersStaticState extends ControllerStaticStateMap,
  TControllersProps extends ControllersPropsMap,
  TSolutionType extends SolutionType,
> = TSolutionType extends SolutionType.recommendation
  ? {
      /**
       * Executes only the initial search for a given configuration, then returns a resumable snapshot of engine state along with the state of the controllers.
       *
       * Useful for static generation and server-side rendering.
       */
      (
        controllers: Array<keyof TControllers> // TODO:  make the array unique
      ): Promise<EngineStaticState<TSearchAction, TControllersStaticState>>;

      fromBuildResult: FromBuildResult<
        TEngine,
        TControllers,
        FetchStaticStateOptions,
        EngineStaticState<TSearchAction, TControllersStaticState>
      >;
    }
  : {
      /**
       * Executes only the initial search for a given configuration, then returns a resumable snapshot of engine state along with the state of the controllers.
       *
       * Useful for static generation and server-side rendering.
       */
      (
        ...params: OptionsTuple<
          FetchStaticStateOptions &
            EngineDefinitionControllersPropsOption<TControllersProps>
        >
      ): Promise<EngineStaticState<TSearchAction, TControllersStaticState>>;

      fromBuildResult: FromBuildResult<
        TEngine,
        TControllers,
        FetchStaticStateOptions,
        EngineStaticState<TSearchAction, TControllersStaticState>
      >;
    };
buildBaseCommerceAPIRequest;
