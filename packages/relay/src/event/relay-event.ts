import type {Environment} from '../environment/environment.js';
import type {RelayPayload} from '../relay-payload.js';
import type {RelayConfig} from '../relay.js';
import {createMeta, type Meta} from './meta/meta.js';

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
  environment: Environment
): Readonly<RelayEvent> {
  return {
    ...payload,
    meta: createMeta(type, config, environment),
  };
}
