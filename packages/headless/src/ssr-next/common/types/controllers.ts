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
   * For controllers defined with props, the state they were built with. When the static state has no
   * `controllerProps`, hydration uses it as the initial state of the controllers you defined; the
   * `parameterManager` and the commerce `context` are rebuilt from `searchParams` and `context` instead.
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
