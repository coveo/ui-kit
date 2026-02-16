import type {UnknownAction} from '@reduxjs/toolkit';
import type {Controller} from '../../../controllers/controller/headless-controller.js';
import type {
  ControllersMap,
  ControllersPropsMap,
} from '../../common/types/controllers.js';
import type {BuildConfig} from './build.js';
import type {SolutionType} from './controller-constants.js';
import type {
  CommerceEngineDefinitionControllersPropsOption,
  ControllerDefinitionsMap,
} from './controller-definitions.js';
import type {CommerceEngineDefinitionBuildResult} from './engine.js';

export type HydratedState<TControllers extends ControllersMap> =
  CommerceEngineDefinitionBuildResult<TControllers>;

export interface HydrateStaticStateOptions<TSearchAction> {
  searchActions: TSearchAction[];
}

/**
 * Creates a new engine from the snapshot of the engine created in SSR with fetchStaticState.
 *
 * Useful when hydrating a server-side-rendered engine.
 */
export type HydrateStaticState<
  TControllers extends ControllersMap,
  TSearchAction extends UnknownAction,
  TControllersProps extends ControllersPropsMap,
  TControllersDefinitionsMap extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
> = (
  params: HydrateStaticStateOptions<TSearchAction> &
    BuildConfig<TControllersDefinitionsMap, TSolutionType> &
    CommerceEngineDefinitionControllersPropsOption<
      TControllersDefinitionsMap,
      TControllersProps,
      TSolutionType
    >
) => Promise<HydratedState<TControllers>>;
