import type {UnknownAction} from '@reduxjs/toolkit';
import type {Controller} from '../../../controllers/controller/headless-controller.js';
import type {
  ControllerStaticStateMap,
  ControllersMap,
  ControllersPropsMap,
} from '../../common/types/controllers.js';
import type {SolutionType} from './controller-constants.js';
import type {
  ControllerDefinitionsMap,
  EngineDefinitionControllersPropsOption,
  OptionsTuple,
} from './controller-definitions.js';
import type {EngineStaticState} from './engine.js';
import type {FromBuildResult} from './from-build-result.js';

/**
 * @deprecated This interface will be remove on the next major version.
 * Use BuildConfig interface instead
 */
export type FetchStaticStateOptions = {};

export type FetchStaticState<
  TControllers extends ControllersMap,
  TSearchAction extends UnknownAction,
  TControllersStaticState extends ControllerStaticStateMap,
  TControllersProps extends ControllersPropsMap,
  TControllersDefinitionsMap extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
> = {
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

  /**
   * @deprecated Use the fetchStaticState() method instead
   */
  fromBuildResult: FromBuildResult<
    TControllers,
    FetchStaticStateOptions,
    EngineStaticState<TSearchAction, TControllersStaticState>
  >;
};
