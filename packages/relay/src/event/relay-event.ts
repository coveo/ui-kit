import { Environment } from "../environment/environment";
import { RelayOptions, RelayPayload } from "../relay";
import { createMeta, Meta } from "./meta/meta";

export interface RelayEvent extends RelayPayload {
  meta: Meta;
}

export function createRelayEvent(
  type: string,
  payload: RelayPayload,
  options: RelayOptions,
  environment: Environment
): Readonly<RelayEvent> {
  return {
    ...payload,
    meta: createMeta(type, options, environment),
  };
}
