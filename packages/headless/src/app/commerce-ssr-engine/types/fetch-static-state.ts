import type {UnknownAction} from '@reduxjs/toolkit';
import type {Controller} from '../../../controllers/controller/headless-controller.js';
import {SolutionType} from '../../commerce-ssr-engine/types/common.js';
import type {
  ControllerDefinitionsMap,
  EngineDefinitionControllersPropsOption,
  EngineStaticState,
} from '../../commerce-ssr-engine/types/common.js';
import type {CoreEngine, CoreEngineNext} from '../../engine.js';
import type {
  ControllersMap,
  ControllersPropsMap,
  ControllerStaticStateMap,
  OptionsTuple,
} from '../../ssr-engine/types/common.js';
import {FromBuildResult} from './from-build-result.js';

export type FetchStaticStateOptions = {};

export type FetchStaticState<
  TEngine extends CoreEngine | CoreEngineNext,
  TControllers extends ControllersMap,
  TSearchAction extends UnknownAction,
  TControllersStaticState extends ControllerStaticStateMap,
  TControllersProps extends ControllersPropsMap,
  TControllersDefinitionsMap extends ControllerDefinitionsMap<
    TEngine,
    Controller
  >,
  TSolutionType extends SolutionType,
> = TSolutionType extends SolutionType.recommendation
  ? {
      /**
       * Executes only the initial search for a given configuration, then returns a resumable snapshot of engine state along with the state of the controllers.
       *
       * Useful for static generation and server-side rendering.
       */
      (
        controllers: Array<keyof TControllers>
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
            EngineDefinitionControllersPropsOption<
              TControllersDefinitionsMap,
              TControllersProps,
              TSolutionType
            >
        >
      ): Promise<EngineStaticState<TSearchAction, TControllersStaticState>>;

      fromBuildResult: FromBuildResult<
        TEngine,
        TControllers,
        FetchStaticStateOptions,
        EngineStaticState<TSearchAction, TControllersStaticState>
      >;
    };
