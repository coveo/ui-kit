/**
 * Remote controller (generic, schema-validated) — INTERNAL.
 *
 * `buildRemoteController` builds one {@link RemoteController} for a single
 * server-owned entry in the ACTIVE turn's AG-UI state snapshot
 * (`response.state.components[componentId]`), validated against the injected
 * contracts schema. The controller never mutates its local state; action
 * results arrive through a subsequent snapshot from the server.
 *
 * This module is INTERNAL to the package. `buildRemoteController`,
 * `RemoteControllerSource`, and `selectRemoteControllerState` are NOT part of
 * the public surface; the session vends controllers by delegating here.
 *
 * The controller depends only on a narrow `source` seam
 * (`Pick<Session internals, 'state' | 'subscribe' | 'dispatchAction'>`) so it
 * stays unit-testable against a fake source without a live session.
 */

import type {z} from 'zod/v4';
import type {RemoteAction} from '@/src/session/create-session.js';
import type {Unsubscribe} from '@/src/session/store.js';
import type {Turn} from '@/src/session/types.js';
import type {
  ComponentTypeOf,
  ContractFor,
  ContractsSchema,
  RemoteController,
  StateFor,
} from './types.js';

/**
 * The narrow session-internal seam the remote controller reads from. It mirrors
 * `Pick<Session internals, 'state' | 'subscribe' | 'dispatchAction'>`:
 *
 * - `state()` returns the current session runtime snapshot (the observable
 *   store's state), from which the controller resolves the active turn's
 *   `response.state.components[componentId]`.
 * - `subscribe(listener)` registers a listener invoked once per store change.
 * - `dispatchAction(action)` forwards a validated remote action to the session
 *   runtime (which issues the network call).
 */
export interface RemoteControllerSource {
  state(): RemoteControllerSourceState;
  subscribe(listener: () => void): Unsubscribe;
  dispatchAction(action: RemoteAction): Promise<void>;
}

/**
 * The subset of the session runtime snapshot the controller reads: the turn
 * list plus the active turn id. Kept structural so a fake source can supply it
 * without depending on the full store state type.
 */
interface RemoteControllerSourceState {
  turns: readonly Turn[];
  activeTurnId?: string;
}

/**
 * The options accepted by {@link buildRemoteController}.
 */
export interface BuildRemoteControllerOptions<
  TContracts extends ContractsSchema,
  T extends ComponentTypeOf<TContracts>,
> {
  source: RemoteControllerSource;
  componentId: string;
  componentType: T;
  contracts: TContracts;
}

/**
 * The strict shape of a single component contract once resolved from the
 * discriminated union: it exposes a `state` schema and an `actions` object
 * schema whose members carry a `payload` schema.
 */
type ResolvedContract = {
  shape: {
    state: z.ZodType;
    actions: {shape: Record<string, {shape: {payload: z.ZodType}} | undefined>};
  };
};

const EMPTY_REMOTE_CONTROLLER_STATE = {};

class RemoteControllerImpl<
  TContracts extends ContractsSchema,
  T extends ComponentTypeOf<TContracts>,
> implements RemoteController<TContracts, T> {
  readonly componentId: string;
  readonly #source: RemoteControllerSource;
  readonly #componentType: T;
  readonly #contract: ResolvedContract;
  #lastRawState: unknown = EMPTY_REMOTE_CONTROLLER_STATE;
  #lastValidatedState: StateFor<TContracts, T> | undefined;

  constructor(options: BuildRemoteControllerOptions<TContracts, T>, contract: ResolvedContract) {
    this.componentId = options.componentId;
    this.#source = options.source;
    this.#componentType = options.componentType;
    this.#contract = contract;
    // Prime the derived-state cache so the first `state` read reflects the
    // current snapshot rather than the sentinel initial value.
    this.#deriveState();
  }

  get state(): StateFor<TContracts, T> | undefined {
    return this.#deriveState();
  }

  /**
   * Resolves the active turn's component snapshot, validates it against the
   * injected contract's `state` schema, and memoizes the result keyed on the
   * raw snapshot reference. A missing or empty (`{}`) snapshot — or one that
   * fails validation — yields `undefined`.
   */
  #deriveState(): StateFor<TContracts, T> | undefined {
    const rawState = selectRemoteControllerState(this.#source.state(), this.componentId);
    if (rawState === this.#lastRawState) {
      return this.#lastValidatedState;
    }

    this.#lastRawState = rawState;
    if (rawState === EMPTY_REMOTE_CONTROLLER_STATE) {
      this.#lastValidatedState = undefined;
      return this.#lastValidatedState;
    }

    const result = this.#contract.shape.state.safeParse(rawState);
    this.#lastValidatedState = result.success
      ? (result.data as StateFor<TContracts, T>)
      : undefined;
    return this.#lastValidatedState;
  }

  subscribe(listener: () => void): Unsubscribe {
    let previousState = this.state;

    return this.#source.subscribe(() => {
      const nextState = this.#deriveState();
      if (nextState === previousState) {
        return;
      }

      previousState = nextState;
      listener();
    });
  }

  dispatch(action: string, payload: unknown): Promise<void> {
    const actionEntry = this.#contract.shape.actions.shape[action];
    if (!actionEntry) {
      return Promise.reject(
        new Error(
          `Unknown component action "${action}" for component "${this.componentId}": not defined in the contract.`
        )
      );
    }

    const result = actionEntry.shape.payload.safeParse(payload);
    if (!result.success) {
      return Promise.reject(
        new Error(
          `Invalid payload for component action "${action}" on component "${this.componentId}": failed schema validation.`
        )
      );
    }

    return this.#source.dispatchAction({
      componentId: this.componentId,
      componentType: this.#componentType,
      action,
      payload: result.data,
    });
  }
}

/**
 * Builds a {@link RemoteController} for one server-owned entry in the active
 * turn's AG-UI state snapshot, generic over the injected `contracts` schema.
 *
 * INTERNAL: vended by the session; not a public export.
 */
export function buildRemoteController<
  TContracts extends ContractsSchema,
  T extends ComponentTypeOf<TContracts>,
>(options: BuildRemoteControllerOptions<TContracts, T>): RemoteController<TContracts, T> {
  const contract = findComponentContract(options.contracts, options.componentType);
  return new RemoteControllerImpl(options, contract as unknown as ResolvedContract);
}

/**
 * Resolves the single component contract within `contracts` whose
 * `componentType` literal matches `componentType`. Throws when no contract
 * declares that component type.
 */
function findComponentContract<
  TContracts extends ContractsSchema,
  T extends ComponentTypeOf<TContracts>,
>(contracts: TContracts, componentType: T): ContractFor<TContracts, T> {
  const contract = contracts.options.find(
    (candidate) => candidate.shape.componentType.value === componentType
  );
  if (!contract) {
    throw new Error(`Unknown component contract: ${String(componentType)}.`);
  }
  return contract as ContractFor<TContracts, T>;
}

/**
 * Selects the raw component snapshot for `componentId` from the active turn's
 * `response.state.components`, returning the shared empty sentinel when the
 * active turn, its state, its `components` map, or the entry is missing, is not
 * a record, or is an empty record (`{}`). The design treats a missing or empty
 * snapshot identically (both yield `undefined` state).
 * Callers compare the returned reference identity to detect change.
 */
function selectRemoteControllerState(
  state: RemoteControllerSourceState,
  componentId: string
): unknown {
  const activeTurn = state.activeTurnId
    ? state.turns.find((turn) => turn.id === state.activeTurnId)
    : undefined;

  const components = activeTurn?.response?.state?.['components'];
  if (!isRecord(components)) {
    return EMPTY_REMOTE_CONTROLLER_STATE;
  }

  const componentState = components[componentId];
  if (!isRecord(componentState) || Object.keys(componentState).length === 0) {
    return EMPTY_REMOTE_CONTROLLER_STATE;
  }
  return componentState;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
