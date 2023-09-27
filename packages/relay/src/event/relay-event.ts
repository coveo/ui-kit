import { ClientIdManager } from "../client-id/client-id";
import { Environment } from "../environment/environment";
import { RelayConfig, RelayPayload } from "../relay";
import { createMeta, Meta } from "./meta/meta";

export interface RelayEvent extends RelayPayload {
  meta: Readonly<Meta>;
}

export function createRelayEvent(
  type: string,
  payload: RelayPayload,
  config: RelayConfig,
  environment: Environment,
  clientIdManager: ClientIdManager
): Readonly<RelayEvent> {
  return {
    ...payload,
    meta: createMeta(type, config, environment, clientIdManager),
  };
}
