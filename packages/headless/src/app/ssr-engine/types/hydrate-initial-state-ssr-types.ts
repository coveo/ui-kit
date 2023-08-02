import {AnyAction} from '@reduxjs/toolkit';
import {Controller} from '../../../controllers';
import {CoreEngine} from '../../engine';
import {
  ControllerDefinitionsMap,
  ControllersMap,
  ControllersPropsMap,
  EngineAndControllers,
  InferControllersMapFromDefinition,
} from './common-ssr-types';
import {EngineDefinition} from './core-engine-ssr-types';

export interface EngineDefinitionHydrateOptionsWithoutProps<
  TSearchFulfilledAction extends AnyAction
> {
  searchFulfilledAction: TSearchFulfilledAction;
}

export type HydrateInitialStateWithoutProps<
  TEngine extends CoreEngine,
  TControllers extends ControllersMap,
  TSearchFulfilledAction extends AnyAction
> = {
  /**
   * Creates a new engine from the snapshot of a previous engine.
   *
   * Useful when hydrating a server-side-rendered engine.
   */
  hydrateInitialState(
    options: EngineDefinitionHydrateOptionsWithoutProps<TSearchFulfilledAction>
  ): Promise<EngineAndControllers<TEngine, TControllers>>;
};

export interface EngineDefinitionHydrateOptionsWithProps<
  TSearchFulfilledAction extends AnyAction,
  TControllersProps extends ControllersPropsMap
> extends EngineDefinitionHydrateOptionsWithoutProps<TSearchFulfilledAction> {
  controllers: TControllersProps;
}

export type HydrateInitialStateWithProps<
  TEngine extends CoreEngine,
  TControllers extends ControllersMap,
  TSearchFulfilledAction extends AnyAction,
  TControllersProps extends ControllersPropsMap
> = {
  /**
   * Creates a new engine from the snapshot of a previous engine.
   *
   * Useful when hydrating a server-side-rendered engine.
   */
  hydrateInitialState(
    options: EngineDefinitionHydrateOptionsWithProps<
      TSearchFulfilledAction,
      TControllersProps
    >
  ): Promise<EngineAndControllers<TEngine, TControllers>>;
};

/**
 * @internal
 */
export type InferHydrationResult<
  T extends EngineDefinition<
    CoreEngine,
    ControllerDefinitionsMap<CoreEngine, Controller>,
    // TODO: Replace with a specific type if possible
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any
  >
> = T extends EngineDefinition<infer TEngine, infer TControllers, infer _>
  ? EngineAndControllers<
      TEngine,
      InferControllersMapFromDefinition<TControllers>
    >
  : never;
