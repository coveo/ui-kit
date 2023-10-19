import { Environment } from "../environment/environment";
import { ListenerManager } from "../listener/listener";
import { validate } from "../validate/validate";
import { RelayEvent } from "../event/relay-event";
import { RelayConfig } from "../relay";

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

export async function emitEvent({ event, config, environment }: EmitParams): Promise<null> {
  const { url, token } = config;

  return environment.send(url, token, JSON.stringify([event]));
}
