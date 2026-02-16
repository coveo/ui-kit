import type {Controller} from '../../../controllers/controller/headless-controller.js';
import {clone} from '../../../utils/utils.js';

export type StaticControllerState = {
  initialState?: Controller['state'];
} & Pick<Controller, 'state'>;

/**
 * Builder class for creating static controller
 */
class StaticControllerBuilder {
  private _state?: StaticControllerState['state'];
  private _initialState?: StaticControllerState['initialState'];

  public withState(state: StaticControllerState['state']): this {
    this._state = clone(state);
    return this;
  }

  public withInitialState(
    initialState: StaticControllerState['initialState']
  ): this {
    this._initialState = clone(initialState);
    return this;
  }

  /**
   * Builds and returns the static controller state object
   */
  public build(): StaticControllerState {
    const result: StaticControllerState = {
      state: this._state!,
    };

    if (this._initialState) {
      result.initialState = this._initialState;
    }

    return result;
  }
}

export function createStaticControllerBuilder<TController extends Controller>(
  controller: TController
): StaticControllerBuilder {
  const builder = new StaticControllerBuilder().withState(controller.state);

  if ('initialState' in controller) {
    builder.withInitialState(
      (controller as Required<StaticControllerState>).initialState
    );
  }

  return builder;
}
