import type {z} from 'zod/v4';
import {ControllerContractsSchema, type ControllerContracts} from '@coveo/thermidor-schema';
import type {ConverseController} from '../converse/converse-controller.js';
import type {Controller} from '../controller-types.js';

export interface RemoteControllerAction<TAction extends string = string, TPayload = unknown> {
  controllerId: string;
  controllerSchema: string;
  action: TAction;
  payload: TPayload;
}

export type RemoteControllerSchemaId = ControllerContracts['controllerSchema'];

type ControllerContractSchema = (typeof ControllerContractsSchema)['options'][number];

type ControllerContractSchemaFor<TSchema extends RemoteControllerSchemaId> = Extract<
  ControllerContractSchema,
  {shape: {controllerSchema: {value: TSchema}}}
>;

export type RemoteControllerActionNameForSchema<TSchema extends RemoteControllerSchemaId> =
  keyof z.infer<ControllerContractSchemaFor<TSchema>['shape']['actions']> & string;

export type RemoteControllerActionPayloadForSchema<
  TSchema extends RemoteControllerSchemaId,
  TAction extends RemoteControllerActionNameForSchema<TSchema>,
> =
  z.infer<ControllerContractSchemaFor<TSchema>['shape']['actions']> extends Record<
    TAction,
    {payload: infer TPayload}
  >
    ? TPayload
    : never;

export type RemoteControllerStateForSchema<TSchema extends RemoteControllerSchemaId> = z.infer<
  ControllerContractSchemaFor<TSchema>['shape']['state']
>;

export type RemoteControllerActionsForSchema<TSchema extends RemoteControllerSchemaId> = z.infer<
  ControllerContractSchemaFor<TSchema>['shape']['actions']
>;

/**
 * A controller state source backed by Thermidor's active conversation turn.
 */
export type RemoteControllerSource = Pick<
  ConverseController,
  'state' | 'subscribe' | 'dispatchAction'
>;

export interface RemoteController<TSchema extends RemoteControllerSchemaId> extends Controller<
  RemoteControllerStateForSchema<TSchema> | undefined
> {
  readonly controllerId: string;
  dispatch<TAction extends RemoteControllerActionNameForSchema<TSchema>>(
    action: TAction,
    payload: RemoteControllerActionPayloadForSchema<TSchema, TAction>
  ): Promise<void>;
}

export type AdvertisedRemoteController<TSchema extends RemoteControllerSchemaId> =
  RemoteController<TSchema>;

export interface RemoteControllerOptions<TSchema extends RemoteControllerSchemaId> {
  source: RemoteControllerSource;
  controllerId: string;
  /** The static controller schema ID advertised by the A2-UI component. */
  contract: TSchema;
}

class RemoteControllerImpl<
  TSchema extends RemoteControllerSchemaId,
> implements RemoteController<TSchema> {
  readonly controllerId: string;
  #lastRawState: unknown;
  #lastValidatedState: RemoteControllerStateForSchema<TSchema> | undefined;

  constructor(
    private readonly source: RemoteControllerSource,
    controllerId: string,
    private readonly contract: ControllerContractSchemaFor<TSchema>
  ) {
    this.controllerId = controllerId;
  }

  get state(): RemoteControllerStateForSchema<TSchema> | undefined {
    const rawState = selectRemoteControllerState(this.source.state, this.controllerId);
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
    callback: (state: RemoteControllerStateForSchema<TSchema> | undefined) => void
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

  dispatch<TAction extends RemoteControllerActionNameForSchema<TSchema>>(
    action: TAction,
    payload: RemoteControllerActionPayloadForSchema<TSchema, TAction>
  ): Promise<void> {
    const actionsShape = this.contract.shape.actions.shape as Record<
      string,
      {shape: {payload: z.ZodType}} | undefined
    >;
    const actionEntry = actionsShape[action];
    if (!actionEntry) {
      return Promise.reject(new Error(`Unknown controller action ${this.controllerId}/${action}.`));
    }

    const payloadSchema = actionEntry.shape.payload;
    const result = payloadSchema.safeParse(payload);
    if (!result.success) {
      return Promise.reject(
        new Error(`Invalid payload for controller action ${this.controllerId}/${action}.`)
      );
    }

    return this.source.dispatchAction({
      controllerId: this.controllerId,
      controllerSchema: this.contract.shape.controllerSchema.value,
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
export function buildRemoteController<TSchema extends RemoteControllerSchemaId>(
  options: RemoteControllerOptions<TSchema>
): RemoteController<TSchema> {
  const schema = findControllerContract(options.contract);
  return new RemoteControllerImpl(options.source, options.controllerId, schema);
}

function findControllerContract<TSchema extends RemoteControllerSchemaId>(
  schemaId: TSchema
): ControllerContractSchemaFor<TSchema> {
  const contract = ControllerContractsSchema.options.find(
    (candidate): candidate is ControllerContractSchemaFor<TSchema> =>
      candidate.shape.controllerSchema.value === schemaId
  );
  if (!contract) {
    throw new Error(`Unknown controller contract ${schemaId}.`);
  }

  return contract;
}

function isRemoteControllerState<TSchema extends RemoteControllerSchemaId>(
  contract: ControllerContractSchemaFor<TSchema>,
  state: unknown
): state is RemoteControllerStateForSchema<TSchema> {
  return contract.shape.state.safeParse(state).success;
}

const EMPTY_REMOTE_CONTROLLER_STATE = {};

export function selectRemoteControllerState(
  state: RemoteControllerSource['state'],
  controllerId: string
): unknown {
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
