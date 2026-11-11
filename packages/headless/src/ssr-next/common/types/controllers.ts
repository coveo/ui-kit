import type {Controller} from '../../../controllers/controller/headless-controller.js';

export interface ControllersMap {
  [customName: string]: Controller;
}

export interface ControllerStaticState<TState> {
  /**
   * The state of the controller when the static state was fetched.
   */
  state: TState;
}

export interface ControllerStaticStateMap {
  [customName: string]: ControllerStaticState<unknown>;
}
