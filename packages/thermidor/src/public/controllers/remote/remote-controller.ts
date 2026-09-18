import type {z} from 'zod/v4';
import {ComponentContractsSchema, type ComponentContracts} from '@coveo/thermidor-schema';
import type {UnifiedConverseController} from '../unified-converse/unified-converse-controller.js';
import type {Controller} from '../controller-types.js';

/**
 * A typed action a {@link RemoteController} dispatches back to the AG-UI gateway,
 * targeting one server-owned component in the active turn's state snapshot.
 */
export interface RemoteControllerAction<TAction extends string = string, TPayload = unknown> {
  /** Id of the component instance the action targets. */
  componentId: string;
  /** Type of the targeted component (the contract discriminant). */
  componentType: string;
  /** The action name, as defined by the component's contract. */
  action: TAction;
  /** The action payload, as defined by the component's contract. */
  payload: TPayload;
}

/**
 * The union of component-type discriminants defined by the Thermidor schema.
 */
export type ComponentType = ComponentContracts['componentType'];

export type RemoteControllerContractSchemaFor<TComponentType extends ComponentType> = Extract<
  (typeof ComponentContractsSchema)['options'][number],
  {shape: {componentType: {value: TComponentType}}}
>;

type RemoteControllerActionNameForSchema<TComponentType extends ComponentType> = keyof z.infer<
  RemoteControllerContractSchemaFor<TComponentType>['shape']['actions']
> &
  string;

type RemoteControllerActionPayloadForSchema<
  TComponentType extends ComponentType,
  TAction extends RemoteControllerActionNameForSchema<TComponentType>,
> =
  z.infer<RemoteControllerContractSchemaFor<TComponentType>['shape']['actions']> extends Record<
    TAction,
    {payload: infer TPayload}
  >
    ? TPayload
    : never;

type RemoteControllerStateForSchema<TComponentType extends ComponentType> = z.infer<
  RemoteControllerContractSchemaFor<TComponentType>['shape']['state']
>;

/**
 * A controller state source backed by Thermidor's active conversation turn.
 */
export type RemoteControllerSource = Pick<
  UnifiedConverseController,
  'state' | 'subscribe' | 'dispatchAction'
>;

/**
 * A controller over one server-owned component in the active turn's state
 * snapshot. Its {@link Controller.state} is the validated component state (or
 * `undefined` until the component appears); it never mutates state locally —
 * dispatched actions are reflected by a subsequent server snapshot.
 *
 * @typeParam TComponentType - The component-type discriminant this controller targets.
 */
export interface RemoteController<TComponentType extends ComponentType> extends Controller<
  RemoteControllerStateForSchema<TComponentType> | undefined
> {
  /** Id of the component instance this controller targets. */
  readonly componentId: string;
  /**
   * Dispatches a typed, contract-checked action for this component to the gateway.
   *
   * @param action - The action name defined by the component's contract.
   * @param payload - The action payload, typed to the contract.
   * @returns A promise that resolves once the action has been sent.
   */
  dispatch<TAction extends RemoteControllerActionNameForSchema<TComponentType>>(
    action: TAction,
    payload: RemoteControllerActionPayloadForSchema<TComponentType, TAction>
  ): Promise<void>;
}

/**
 * Options for {@link buildRemoteController}.
 *
 * @typeParam TComponentType - The component-type discriminant to bind to.
 */
export interface RemoteControllerOptions<TComponentType extends ComponentType> {
  /** The state source (typically the unified converse controller). */
  source: RemoteControllerSource;
  /** Id of the component instance to control. */
  componentId: string;
  /** Type of the component to control (selects the contract). */
  componentType: TComponentType;
}

class RemoteControllerImpl<
  TComponentType extends ComponentType,
> implements RemoteController<TComponentType> {
  readonly componentId: string;
  #lastRawState: unknown;
  #lastValidatedState: RemoteControllerStateForSchema<TComponentType> | undefined;

  constructor(
    private readonly source: RemoteControllerSource,
    componentId: string,
    private readonly componentType: TComponentType,
    private readonly contract: RemoteControllerContractSchemaFor<TComponentType>
  ) {
    this.componentId = componentId;
  }

  get state(): RemoteControllerStateForSchema<TComponentType> | undefined {
    const rawState = selectRemoteControllerState(this.source.state, this.componentId);
    if (rawState === this.#lastRawState) {
      return this.#lastValidatedState;
    }

    this.#lastRawState = rawState;
    const result = this.contract.shape.state.safeParse(rawState);
    this.#lastValidatedState =
      result.success && isRemoteControllerState(this.contract, result.data)
        ? result.data
        : undefined;
    return this.#lastValidatedState;
  }

  subscribe(
    callback: (state: RemoteControllerStateForSchema<TComponentType> | undefined) => void
  ): () => void {
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

  dispatch<TAction extends RemoteControllerActionNameForSchema<TComponentType>>(
    action: TAction,
    payload: RemoteControllerActionPayloadForSchema<TComponentType, TAction>
  ): Promise<void> {
    const actionsShape = this.contract.shape.actions.shape as Record<
      string,
      {shape: {payload: z.ZodType}} | undefined
    >;
    const actionEntry = actionsShape[action];
    if (!actionEntry) {
      return Promise.reject(new Error(`Unknown component action ${this.componentId}/${action}.`));
    }

    const payloadSchema = actionEntry.shape.payload;
    const result = payloadSchema.safeParse(payload);
    if (!result.success) {
      return Promise.reject(
        new Error(`Invalid payload for component action ${this.componentId}/${action}.`)
      );
    }

    return this.source.dispatchAction({
      componentId: this.componentId,
      componentType: this.componentType,
      action,
      payload: result.data,
    });
  }
}

/**
 * Creates a controller for one server-owned entry in the active AG-UI state
 * snapshot. The controller never mutates its local state; action results arrive
 * through a subsequent snapshot from the server.
 */
export function buildRemoteController<TComponentType extends ComponentType>(
  options: RemoteControllerOptions<TComponentType>
): RemoteController<TComponentType> {
  const contract = findComponentContract(options.componentType);
  return new RemoteControllerImpl(
    options.source,
    options.componentId,
    options.componentType,
    contract
  );
}

export function findComponentContract<TComponentType extends ComponentType>(
  componentType: TComponentType
): RemoteControllerContractSchemaFor<TComponentType> {
  const contract = ComponentContractsSchema.options.find(
    (candidate): candidate is RemoteControllerContractSchemaFor<TComponentType> =>
      candidate.shape.componentType.value === componentType
  );
  if (!contract) {
    throw new Error(`Unknown component contract: ${componentType}.`);
  }
  return contract;
}

function isRemoteControllerState<TComponentType extends ComponentType>(
  contract: RemoteControllerContractSchemaFor<TComponentType>,
  state: unknown
): state is RemoteControllerStateForSchema<TComponentType> {
  return contract.shape.state.safeParse(state).success;
}

const EMPTY_REMOTE_CONTROLLER_STATE = {};

/**
 * Selects the raw state of a single component from a controller state source
 * (the active turn's AG-UI state snapshot), by component id. Returns an empty
 * object when the snapshot or component is absent. The returned value is
 * unvalidated; {@link buildRemoteController} validates it against the contract.
 *
 * @param state - The state of a {@link RemoteControllerSource}.
 * @param componentId - The id of the component whose state to select.
 * @returns The component's raw state, or an empty object when not present.
 */
export function selectRemoteControllerState(
  state: RemoteControllerSource['state'],
  componentId: string
): unknown {
  const snapshot = state.activeTurn?.agentResponse?.state;
  if (!isRecord(snapshot)) {
    return EMPTY_REMOTE_CONTROLLER_STATE;
  }

  const components = snapshot['components'];
  if (!isRecord(components)) {
    return EMPTY_REMOTE_CONTROLLER_STATE;
  }

  const componentState = components[componentId];
  return isRecord(componentState) ? componentState : EMPTY_REMOTE_CONTROLLER_STATE;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
