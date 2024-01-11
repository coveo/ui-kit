import { ClientIdManager } from "../client-id/client-id";
import { Environment } from "../environment/environment";
import { RelayPayload } from "../relay-payload";
import { RelayConfig } from "../relay";
import { createMeta, Meta } from "./meta/meta";

/**
 * Defines the structure of a RelayEvent, extending the RelayPayload.
 */
export interface RelayEvent extends RelayPayload {
  /**
   * Read-only `meta` property of Meta type.
   */
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
