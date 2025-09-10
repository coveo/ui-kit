import type {UnknownAction} from '@reduxjs/toolkit';
import type {Controller} from '../../../controllers/controller/headless-controller.js';
import type {EngineStaticState} from '../../common/types/engine.js';
import type {BuildConfig} from './build.js';
import type {SolutionType} from './controller-constants.js';
import type {
  CommerceEngineDefinitionControllersPropsOption,
  ControllerDefinitionsMap,
  FilteredBakedInControllers,
} from './controller-definitions.js';
import type {InferControllerStaticStateMapFromDefinitionsWithSolutionType} from './controller-inference.js';

export type FetchStaticStateParameters<
  TControllerDefinitions extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
> = BuildConfig<TControllerDefinitions, TSolutionType> &
  CommerceEngineDefinitionControllersPropsOption<
    TControllerDefinitions,
    TSolutionType
  >;

export type InferredStaticState<
  TControllersDefinitionsMap extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
> = InferControllerStaticStateMapFromDefinitionsWithSolutionType<
  TControllersDefinitionsMap,
  TSolutionType
> &
  FilteredBakedInControllers<TSolutionType>;

/**
 * Executes only the initial search for a given configuration, then returns a resumable snapshot of engine state along with the state of the controllers.
 *
 * Useful for static generation and server-side rendering.
 */
export type FetchStaticState<
  TControllersDefinitionsMap extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
  TSearchAction extends UnknownAction = UnknownAction,
> = (
  params: FetchStaticStateParameters<TControllersDefinitionsMap, TSolutionType>
) => Promise<
  EngineStaticState<
    TSearchAction,
    InferredStaticState<TControllersDefinitionsMap, TSolutionType>
  > &
    BuildConfig<TControllersDefinitionsMap, TSolutionType>
>;
