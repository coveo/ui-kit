import type {UnknownAction} from '@reduxjs/toolkit';
import type {Controller} from '../../../controllers/controller/headless-controller.js';
import type {ControllerStaticStateMap, ControllersMap} from '../../common/types/controllers.js';
import type {SolutionType} from './controller-constants.js';
import type {ControllerDefinitionsMap} from './controller-definitions.js';
import type {CommerceEngineDefinitionBuildResult} from './engine.js';
import type {CommerceStaticState} from './fetch-static-state.js';

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
  TControllersStaticState extends ControllerStaticStateMap,
  TControllersDefinitionsMap extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
> = (
  staticState: CommerceStaticState<
    TSearchAction,
    TControllersStaticState,
    TControllersDefinitionsMap,
    TSolutionType
  >
) => Promise<HydratedState<TControllers>>;
