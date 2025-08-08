import type {Controller} from '../../../controllers/controller/headless-controller.js';
import {clone} from '../../../utils/utils.js';
import type {ControllerWithKind} from '../../commerce/types/controller-definitions.js';
import type {Kind} from '../../commerce/types/kind.js';

export type StaticControllerState = {
  initialState?: Controller['state'];
  _kind?: Kind;
} & Pick<ControllerWithKind, 'state'>;

/**
 * Builder class for creating static controller
 */
class StaticControllerBuilder {
  private _state?: StaticControllerState['state'];
  private _kind?: Kind;
  private _initialState?: StaticControllerState['initialState'];

  public withState(state: StaticControllerState['state']): this {
    this._state = clone(state);
    return this;
  }

  public withKind(kind: Kind): this {
    this._kind = kind;
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
  build(): StaticControllerState {
    const result: StaticControllerState = {
      state: this._state!,
    };

    if (this._kind) {
      result._kind = this._kind;
    }

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

  if ('_kind' in controller) {
    builder.withKind((controller as Required<StaticControllerState>)._kind);
  }

  if ('initialState' in controller) {
    builder.withInitialState(
      (controller as Required<StaticControllerState>).initialState
    );
  }

  return builder;
}
