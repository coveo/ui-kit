import type {UnknownAction} from '@reduxjs/toolkit';
import type {Controller} from '../../../controllers/controller/headless-controller.js';
import type {ControllerStaticStateMap} from '../../common/types/controllers.js';
import type {EngineStaticState} from '../../common/types/engine.js';
import type {BuildConfig} from './build.js';
import type {SolutionType} from './controller-constants.js';
import type {
  CommerceEngineDefinitionControllersPropsOption,
  ControllerDefinitionsMap,
  FilteredBakedInControllers,
} from './controller-definitions.js';

export type FetchStaticStateParameters<
  TControllerDefinitions extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
> = BuildConfig<TControllerDefinitions, TSolutionType> &
  CommerceEngineDefinitionControllersPropsOption<
    TControllerDefinitions,
    TSolutionType
  >;

/**
 * Executes only the initial search for a given configuration, then returns a resumable snapshot of engine state along with the state of the controllers.
 *
 * Useful for static generation and server-side rendering.
 */
export type FetchStaticState<
  TSearchAction extends UnknownAction,
  TControllersStaticState extends ControllerStaticStateMap,
  TControllersDefinitionsMap extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
> = (
  params: FetchStaticStateParameters<TControllersDefinitionsMap, TSolutionType>
) => Promise<
  EngineStaticState<
    TSearchAction,
    TControllersStaticState & FilteredBakedInControllers<TSolutionType>
  > &
    BuildConfig<TControllersDefinitionsMap, TSolutionType>
>;
