import type {Controller} from '../../../controllers/controller/headless-controller.js';

export interface ControllersMap {
  [customName: string]: Controller;
}

export interface ControllerStaticState<TState> {
  /**
   * The state of the controller when the static state was fetched.
   */
  state: TState;
  /**
   * For controllers defined with props, the state they were built with. It is used as the initial
   * state of the controller when hydrating without explicit controller props.
   */
  initialState?: TState;
}

export interface ControllerStaticStateMap {
  [customName: string]: ControllerStaticState<unknown>;
}

export interface BaseControllerDefinitionWithoutProps<TEngine, TController extends Controller> {
  build(engine: TEngine, ...args: unknown[]): TController;
}

export interface BaseControllerDefinitionWithProps<
  TEngine,
  TController extends Controller,
  TProps,
> {
  buildWithProps(engine: TEngine, props?: TProps, ...args: unknown[]): TController;
}

export interface ControllersPropsMap {
  [customName: string]: unknown;
}
