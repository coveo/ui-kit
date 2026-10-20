/**
 * PROTOTYPE (KIT-6367): well-known surfaces.
 *
 * A well-known surface template is one the contract declares with a fixed composition and initial
 * state, so the application creates instances of it itself, under surface ids of its choosing,
 * instead of waiting for the producer to send their `createSurface`. The producer's lookups then
 * write an instance's state, with or without a session.
 */

import {deriveA2uiV09Messages} from './a2ui-v09-projection.js';
import type {ContractsSchema} from './contracts.js';
import {
  deriveNodeIdentityRegistry,
  readUpdateDataModelOps,
  validateInboundOp,
  type NodeIdentityRegistry,
} from './in-transit-validation.js';
import type {A2uiV09Message, Activity} from './types.js';

/**
 * A well-known surface template, as `@coveo/thermidor-schema` exports it (`SearchBoxSurface`):
 * its name, and the A2-UI `createSurface` parameters of every instance but its surface id.
 */
export interface WellKnownSurfaceTemplate {
  /** The template name, which every lookup from an instance sends with its action. */
  readonly template: string;
  readonly catalogId: string;
  readonly components: readonly object[];
  readonly dataModel: object;
}

/** One instance of a well-known surface template, created by the application. */
export interface WellKnownSurface {
  /** The surface id the instance was created under: the id its renderer draws. */
  readonly surfaceId: string;
  /** The name of the template it was created from. */
  readonly template: string;
  /**
   * The instance's renderer messages, in the v0.9 shape, append-only: its `createSurface` first,
   * then the `updateDataModel` messages of each lookup result. Feed each new one to the renderer
   * once; replaying them would recreate the surface.
   */
  readonly messages: readonly A2uiV09Message[];
  /**
   * Removes the instance: its in-flight lookups are aborted and later results are dropped. The
   * renderer that drew it is told nothing; delete the surface there when it stays mounted.
   */
  dispose(): void;
}

export interface WellKnownSurfaceOptions {
  /**
   * The instance's surface id. Defaults to a session-unique id derived from the template name.
   * Pass one that is stable across server and client rendering (for example React's `useId`)
   * when the surface is server-rendered.
   */
  surfaceId?: string;
}

export interface WellKnownSurfaces {
  create(template: WellKnownSurfaceTemplate, options?: WellKnownSurfaceOptions): WellKnownSurface;
  /** The template name of a live instance, or `undefined`. */
  templateOf(surfaceId: string): string | undefined;
  /** The `component` discriminant of a node of a live instance. */
  resolve(surfaceId: string, nodeId: string): string | undefined;
  /** Applies the valid `updateDataModel` ops of a lookup's A2-UI messages that target live instances. */
  apply(rawMessages: readonly unknown[]): void;
}

interface Instance {
  template: string;
  messages: readonly A2uiV09Message[];
}

export function createWellKnownSurfaces(
  templates: readonly WellKnownSurfaceTemplate[],
  contracts: ContractsSchema,
  callbacks: {onChange: () => void; onDispose: (surfaceId: string) => void}
): WellKnownSurfaces {
  const knownTemplates = new Set(templates.map(({template}) => template));
  const instances = new Map<string, Instance>();
  const registry: NodeIdentityRegistry = new Map();
  let sequence = 0;

  function create(
    {template, ...createSurface}: WellKnownSurfaceTemplate,
    options: WellKnownSurfaceOptions = {}
  ): WellKnownSurface {
    if (!knownTemplates.has(template)) {
      throw new Error(`The session's contract declares no well-known surface "${template}".`);
    }
    const surfaceId = options.surfaceId ?? `${template}-${++sequence}`;
    if (instances.has(surfaceId)) {
      throw new Error(`A well-known surface "${surfaceId}" already exists.`);
    }

    const activity: Activity = {
      id: `well-known-surface:${surfaceId}`,
      kind: 'a2ui-surface',
      replace: false,
      payload: {messages: [{version: 'v1.0', createSurface: {...createSurface, surfaceId}}]},
    };
    const instance: Instance = {template, messages: deriveA2uiV09Messages([activity])};
    instances.set(surfaceId, instance);
    for (const [id, nodes] of deriveNodeIdentityRegistry([activity])) {
      registry.set(id, nodes);
    }

    return {
      surfaceId,
      template,
      get messages() {
        return instance.messages;
      },
      dispose() {
        if (instances.get(surfaceId) !== instance) {
          return;
        }
        instances.delete(surfaceId);
        registry.delete(surfaceId);
        callbacks.onDispose(surfaceId);
      },
    };
  }

  return {
    create,
    templateOf: (surfaceId) => instances.get(surfaceId)?.template,
    resolve: (surfaceId, nodeId) => registry.get(surfaceId)?.get(nodeId),
    apply(rawMessages) {
      const updates = new Map<Instance, A2uiV09Message[]>();
      for (const op of readUpdateDataModelOps(rawMessages)) {
        const instance = instances.get(op.surfaceId);
        if (!instance) {
          continue;
        }
        const decision = validateInboundOp(op, registry, contracts);
        if (decision.kind === 'forward') {
          updates.set(instance, [
            ...(updates.get(instance) ?? []),
            {
              version: 'v0.9',
              updateDataModel: {
                surfaceId: op.surfaceId,
                path: decision.path,
                value: decision.value,
              },
            },
          ]);
        }
      }
      for (const [instance, messages] of updates) {
        instance.messages = [...instance.messages, ...messages];
      }
      if (updates.size > 0) {
        callbacks.onChange();
      }
    },
  };
}
