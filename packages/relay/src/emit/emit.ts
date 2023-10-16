import { Environment } from "../environment/environment";
import {
  callEventApi,
  EventApiCallParams,
} from "../event-api-call/event-api-caller";
import { RelayEvent } from "../event/relay-event";
import { ListenerManager } from "../listener/listener";
import { RelayConfig } from "../relay";
import { validate } from "../validate/validate";

export interface EmitParams {
  config: RelayConfig;
  environment: Environment;
  event: RelayEvent;
  listenerManager: ListenerManager;
}

export async function emit(params: EmitParams) {
  const { listenerManager, event, config } = params;
  const isEnabled = config.mode !== "disabled";

  isEnabled && listenerManager.call(event);
  return config.mode === "validate" ? validate(params) : emitEvent(params);
}

async function emitEvent(params: EventApiCallParams) {
  await callEventApi(params);
}
