import type {Controller} from '../controller-types.js';
import type {ConverseController, ConverseControllerState} from '../converse/converse-controller.js';

export type RemoteControllerState = Record<string, unknown>;

export interface RemoteControllerAction<TPayload = unknown> {
  controllerId: string;
  action: string;
  payload: TPayload;
}

/**
 * Delivers a controller action to the application's server transport.
 *
 * Thermidor deliberately does not prescribe that transport: the server owns the
 * controller state and must acknowledge a mutation by publishing a later
 * `STATE_SNAPSHOT`.
 */
export type RemoteControllerActionDispatcher = (
  action: RemoteControllerAction
) => void | Promise<void>;

/**
 * A controller state source backed by Thermidor's active conversation turn.
 */
export type RemoteControllerSource = Pick<ConverseController, 'state' | 'subscribe'>;

class RemoteControllerImpl<
  TState extends RemoteControllerState,
> implements RemoteController<TState> {
  readonly controllerId: string;

  constructor(
    private readonly source: RemoteControllerSource,
    controllerId: string,
    private readonly dispatchAction: RemoteControllerActionDispatcher
  ) {
    this.controllerId = controllerId;
  }

  get state(): TState {
    return selectRemoteControllerState(this.source.state, this.controllerId) as TState;
  }

  subscribe(callback: (state: TState) => void): () => void {
    let previousState = this.state;

    return this.source.subscribe(() => {
      const nextState = this.state;
      if (nextState === previousState) {
        return;
      }

      previousState = nextState;
      callback(nextState);
    });
  }

  dispatch<TPayload>(action: string, payload: TPayload): Promise<void> {
    if (!action.trim()) {
      return Promise.reject(new Error('A controller action name is required.'));
    }

    return Promise.resolve().then(() =>
      this.dispatchAction({
        controllerId: this.controllerId,
        action,
        payload,
      })
    );
  }
}

/**
 * Creates a controller for one server-owned entry in the active AG-UI state
 * snapshot. The controller never mutates its local state; action results arrive
 * through a subsequent snapshot from the server.
 */
export function buildRemoteController<TState extends RemoteControllerState>(
  options: RemoteControllerOptions
): RemoteController<TState> {
  return new RemoteControllerImpl<TState>(
    options.source,
    options.controllerId,
    options.dispatchAction
  );
}

export interface RemoteController<
  TState extends RemoteControllerState = RemoteControllerState,
> extends Controller<TState> {
  /** The runtime key used to select this controller's state from `controllers`. */
  readonly controllerId: string;

  /**
   * Emits an action for this controller through the configured server transport.
   * State remains server-owned and changes only when the server sends a snapshot.
   */
  dispatch<TPayload>(action: string, payload: TPayload): Promise<void>;
}

export interface RemoteControllerOptions {
  source: RemoteControllerSource;
  controllerId: string;
  dispatchAction: RemoteControllerActionDispatcher;
}

const EMPTY_REMOTE_CONTROLLER_STATE: RemoteControllerState = {};

export function selectRemoteControllerState(
  state: ConverseControllerState,
  controllerId: string
): RemoteControllerState {
  const snapshot = state.activeTurn?.agentResponse?.state;
  if (!isRecord(snapshot)) {
    return EMPTY_REMOTE_CONTROLLER_STATE;
  }

  const controllers = snapshot['controllers'];
  if (!isRecord(controllers)) {
    return EMPTY_REMOTE_CONTROLLER_STATE;
  }

  const controllerState = controllers[controllerId];
  return isRecord(controllerState) ? controllerState : EMPTY_REMOTE_CONTROLLER_STATE;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
