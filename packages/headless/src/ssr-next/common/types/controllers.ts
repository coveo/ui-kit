import type {Controller} from '../../../controllers/controller/headless-controller.js';

export interface ControllersMap {
  [customName: string]: Controller;
}

export interface ControllerStaticState<TState> {
  state: TState;
}

export interface ControllerStaticStateMap {
  [customName: string]: ControllerStaticState<unknown>;
}

export interface BaseControllerDefinitionWithoutProps<
  TEngine,
  TController extends Controller,
> {
  build(engine: TEngine, ...args: unknown[]): TController;
}

export interface BaseControllerDefinitionWithProps<
  TEngine,
  TController extends Controller,
  TProps,
> {
  buildWithProps(
    engine: TEngine,
    props?: TProps,
    ...args: unknown[]
  ): TController;
}

export interface ControllersPropsMap {
  [customName: string]: unknown;
}
