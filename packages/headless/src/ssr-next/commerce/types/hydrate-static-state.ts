import type {UnknownAction} from '@reduxjs/toolkit';
import type {Controller} from '../../../controllers/controller/headless-controller.js';
import type {ControllersMap} from '../../common/types/controllers.js';
import type {BuildConfig} from './build.js';
import type {SolutionType} from './controller-constants.js';
import type {
  CommerceEngineDefinitionControllersPropsOption,
  ControllerDefinitionsMap,
} from './controller-definitions.js';
import type {InferControllerPropsMapFromDefinitions} from './controller-inference.js';
import type {CommerceEngineDefinitionBuildResult} from './engine.js';

export type HydratedState<TControllers extends ControllersMap> =
  CommerceEngineDefinitionBuildResult<TControllers>;

export interface HydrateStaticStateOptions<TSearchAction> {
  searchActions: TSearchAction[];
}

export type HydrateStaticStateParameters<
  TControllerDefinitions extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
> = HydrateStaticStateOptions<UnknownAction> &
  BuildConfig<TControllerDefinitions, TSolutionType> &
  CommerceEngineDefinitionControllersPropsOption<
    TControllerDefinitions,
    InferControllerPropsMapFromDefinitions<TControllerDefinitions>,
    TSolutionType
  >;

/**
 * Creates a new engine from the snapshot of the engine created in SSR with fetchStaticState.
 *
 * Useful when hydrating a server-side-rendered engine.
 */
export type HydrateStaticState<
  TControllers extends ControllersMap,
  TSearchAction extends UnknownAction,
  TControllersDefinitionsMap extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
> = (
  params: HydrateStaticStateOptions<TSearchAction> &
    BuildConfig<TControllersDefinitionsMap, TSolutionType> &
    CommerceEngineDefinitionControllersPropsOption<
      TControllersDefinitionsMap,
      InferControllerPropsMapFromDefinitions<TControllersDefinitionsMap>,
      TSolutionType
    >
) => Promise<HydratedState<TControllers>>;
