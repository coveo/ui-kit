/**
 * PROTOTYPE (KIT-6367): well-known surfaces.
 *
 * A well-known surface is one the contract declares with a fixed surface id and composition, so
 * the session creates it itself, before any request, instead of waiting for the producer to send
 * its `createSurface`. The producer's lookups then write its state, with or without a session.
 */

import {deriveA2uiV09Messages} from './a2ui-v09-projection.js';
import type {ContractsSchema} from './contracts.js';
import {
  deriveNodeIdentityRegistry,
  readUpdateDataModelOps,
  validateInboundOp,
} from './in-transit-validation.js';
import type {A2uiV09Message, Activity} from './types.js';

export interface WellKnownSurfaces {
  /** The renderer messages of every well-known surface, append-only. */
  readonly messages: readonly A2uiV09Message[];
  has(surfaceId: string): boolean;
  /** The `component` discriminant of a node on a well-known surface. */
  resolve(surfaceId: string, nodeId: string): string | undefined;
  /** Applies the valid `updateDataModel` ops of a lookup's A2-UI messages that target them. */
  apply(rawMessages: readonly unknown[]): void;
}

export function createWellKnownSurfaces(
  createSurfaceMessages: readonly Record<string, unknown>[],
  contracts: ContractsSchema,
  onChange: () => void
): WellKnownSurfaces {
  const activity: Activity = {
    id: 'well-known-surfaces',
    kind: 'a2ui-surface',
    replace: false,
    payload: {messages: [...createSurfaceMessages]},
  };
  const registry = deriveNodeIdentityRegistry([activity]);
  let messages: readonly A2uiV09Message[] = deriveA2uiV09Messages([activity]);

  return {
    get messages() {
      return messages;
    },
    has: (surfaceId) => registry.has(surfaceId),
    resolve: (surfaceId, nodeId) => registry.get(surfaceId)?.get(nodeId),
    apply(rawMessages) {
      const updates: A2uiV09Message[] = [];
      for (const op of readUpdateDataModelOps(rawMessages)) {
        if (!registry.has(op.surfaceId)) {
          continue;
        }
        const decision = validateInboundOp(op, registry, contracts);
        if (decision.kind === 'forward') {
          updates.push({
            version: 'v0.9',
            updateDataModel: {surfaceId: op.surfaceId, path: decision.path, value: decision.value},
          });
        }
      }
      if (updates.length > 0) {
        messages = [...messages, ...updates];
        onChange();
      }
    },
  };
}
