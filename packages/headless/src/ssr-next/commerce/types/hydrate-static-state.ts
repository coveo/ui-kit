import type {UnknownAction} from '@reduxjs/toolkit';
import type {Controller} from '../../../controllers/controller/headless-controller.js';
import type {ControllerStaticStateMap, ControllersMap} from '../../common/types/controllers.js';
import type {SSRCommerceEngine} from '../factories/build-factory.js';
import type {SolutionType} from './controller-constants.js';
import type {
  ControllerDefinitionsMap,
  FilteredBakedInControllers,
} from './controller-definitions.js';
import type {CommerceStaticState} from './fetch-static-state.js';

/**
 * The engine and the live controllers returned by `hydrateStaticState()`.
 *
 * Only the controllers available to the solution type are built, including the baked-in ones
 * (`context` and `cart` everywhere, `parameterManager` for search and listing).
 */
export interface HydratedState<
  TControllers extends ControllersMap,
  TSolutionType extends SolutionType,
> {
  engine: SSRCommerceEngine;
  controllers: TControllers & FilteredBakedInControllers<TSolutionType>;
}

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
) => Promise<HydratedState<TControllers, TSolutionType>>;
