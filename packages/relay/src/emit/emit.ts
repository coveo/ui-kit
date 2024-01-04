import { Environment } from "../environment/environment";
import { ListenerManager } from "../listener/listener";
import { RelayEvent } from "../event/relay-event";
import { RelayConfig } from "../relay";

export interface EmitParams {
  config: RelayConfig;
  environment: Environment;
  event: RelayEvent;
  listenerManager: ListenerManager;
}

export function emit({
  config,
  environment,
  event,
  listenerManager,
}: EmitParams) {
  const { url, token, mode } = config;
  const isEnabled = mode !== "disabled";

  if (isEnabled) {
    listenerManager.call(event);
    environment.send(url, token, event);
  }
}
