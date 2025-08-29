import type {UnknownAction} from '@reduxjs/toolkit';
import type {ControllerStaticStateMap} from './controllers.js';

export interface EngineStaticState<
  TSearchAction extends UnknownAction,
  TControllers extends ControllerStaticStateMap,
> {
  // TODO: KIT-4684: make searchAction an array an avoid use the same EngineStaticState for both search and commerce
  searchAction: TSearchAction;
  controllers: TControllers;
}

export type InferStaticState<
  T extends {
    fetchStaticState(...args: unknown[]): Promise<unknown>;
  },
> = Awaited<ReturnType<T['fetchStaticState']>>;

export type InferHydratedState<
  T extends {
    hydrateStaticState(...args: unknown[]): Promise<unknown>;
  },
> = Awaited<ReturnType<T['hydrateStaticState']>>;
