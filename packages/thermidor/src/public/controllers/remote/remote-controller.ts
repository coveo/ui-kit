import type {z} from 'zod/v4';
import {ComponentContractsSchema, type ComponentContracts} from '@coveo/thermidor-schema';
import type {ConverseController} from '../converse/converse-controller.js';
import type {Controller} from '../controller-types.js';

export interface RemoteControllerAction<TAction extends string = string, TPayload = unknown> {
  componentId: string;
  componentType: string;
  action: TAction;
  payload: TPayload;
}

export type ComponentType = ComponentContracts['componentType'];

export type RemoteControllerContractSchemaFor<TComponentType extends ComponentType> = Extract<
  (typeof ComponentContractsSchema)['options'][number],
  {shape: {componentType: {value: TComponentType}}}
>;

export type RemoteControllerActionNameForSchema<TComponentType extends ComponentType> =
  keyof z.infer<RemoteControllerContractSchemaFor<TComponentType>['shape']['actions']> & string;

export type RemoteControllerActionPayloadForSchema<
  TComponentType extends ComponentType,
  TAction extends RemoteControllerActionNameForSchema<TComponentType>,
> =
  z.infer<RemoteControllerContractSchemaFor<TComponentType>['shape']['actions']> extends Record<
    TAction,
    {payload: infer TPayload}
  >
    ? TPayload
    : never;

export type RemoteControllerStateForSchema<TComponentType extends ComponentType> = z.infer<
  RemoteControllerContractSchemaFor<TComponentType>['shape']['state']
>;

/**
 * A controller state source backed by Thermidor's active conversation turn.
 */
export type RemoteControllerSource = Pick<
  ConverseController,
  'state' | 'subscribe' | 'dispatchAction'
>;

export interface RemoteController<TComponentType extends ComponentType> extends Controller<
  RemoteControllerStateForSchema<TComponentType> | undefined
> {
  readonly componentId: string;
  dispatch<TAction extends RemoteControllerActionNameForSchema<TComponentType>>(
    action: TAction,
    payload: RemoteControllerActionPayloadForSchema<TComponentType, TAction>
  ): Promise<void>;
}

export interface RemoteControllerOptions<TComponentType extends ComponentType> {
  source: RemoteControllerSource;
  componentId: string;
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
      return Promise.reject(new Error(`Unknown controller action ${this.componentId}/${action}.`));
    }

    const payloadSchema = actionEntry.shape.payload;
    const result = payloadSchema.safeParse(payload);
    if (!result.success) {
      return Promise.reject(
        new Error(`Invalid payload for controller action ${this.componentId}/${action}.`)
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
