import type {UnknownAction} from '@reduxjs/toolkit';
import type {Controller} from '../../../controllers/controller/headless-controller.js';
import type {
  ControllerStaticStateMap,
  ControllersPropsMap,
} from '../../common/types/controllers.js';
import type {EngineStaticState} from '../../common/types/engine.js';
import type {BuildConfig} from './build.js';
import type {SolutionType} from './controller-constants.js';
import type {
  CommerceEngineDefinitionControllersPropsOption,
  ControllerDefinitionsMap,
  FilteredBakedInControllers,
} from './controller-definitions.js';

/**
 * Executes only the initial search for a given configuration, then returns a resumable snapshot of engine state along with the state of the controllers.
 *
 * Useful for static generation and server-side rendering.
 */
export type FetchStaticState<
  TSearchAction extends UnknownAction,
  TControllersStaticState extends ControllerStaticStateMap,
  TControllersProps extends ControllersPropsMap,
  TControllersDefinitionsMap extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
> = (
  params: BuildConfig<TControllersDefinitionsMap, TSolutionType> &
    CommerceEngineDefinitionControllersPropsOption<
      TControllersDefinitionsMap,
      TControllersProps,
      TSolutionType
    >
) => Promise<
  EngineStaticState<
    TSearchAction,
    TControllersStaticState & FilteredBakedInControllers<TSolutionType>
  > &
    BuildConfig<TControllersDefinitionsMap, TSolutionType>
>;
