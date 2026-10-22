/**
 * Surface instances: the surfaces an application creates from the templates the injected
 * contract declares.
 *
 * A template fixes a surface's composition and initial state, but not its surface id. The
 * application creates instances of it through the session wherever it draws one, so each
 * instance exists before any request, and the producer's lookups only write its state.
 */

import {deriveA2uiV09Messages} from './a2ui-v09-projection.js';
import type {ContractsSchema} from './contracts.js';
import {
  deriveNodeIdentityRegistry,
  readUpdateDataModelOps,
  validateInboundOp,
  type NodeIdentityRegistry,
} from './in-transit-validation.js';
import type {A2uiV09Message} from './types.js';

/**
 * A surface template, as the contract declares it: its name, the A2-UI `createSurface` parameters
 * every instance shares, all but its surface id, and the component union of its own catalog.
 */
export interface SurfaceTemplate {
  /** The template name. Every lookup from an instance sends it as its `surfaceTemplate`. */
  readonly template: string;
  /**
   * The template's own catalog, which no other template and not the conversational catalog uses.
   * Every instance's `createSurface` names it.
   */
  readonly catalogId: string;
  /** The template's components, in A2-UI `createSurface` form. */
  readonly components: readonly object[];
  /** The template's initial data model, in A2-UI `createSurface` form. */
  readonly dataModel: object;
  /**
   * The component union of the template's catalog: exactly the components it places. An
   * instance's lookup payloads and inbound state are validated against it, not against the
   * contract's conversational `components`.
   */
  readonly componentContracts: ContractsSchema;
}

/** One instance of a surface template, created by the session's `instantiateSurface`. */
export interface SurfaceInstance {
  /** The surface id the instance was created under: the id its renderer draws. */
  readonly surfaceId: string;
  /** The name of the template it was created from. */
  readonly template: string;
  /**
   * The instance's renderer messages, in the A2-UI v0.9 shape, append-only: its creation first,
   * then the validated `updateDataModel` messages of each lookup result. Feed each message to the
   * renderer once: replaying them recreates the surface.
   */
  readonly messages: readonly A2uiV09Message[];
  /**
   * Removes the instance: its in-flight lookups are aborted and their late results dropped, and
   * its surface id becomes free again. The renderer is told nothing, so delete the surface there
   * if it stays mounted. Disposing of an instance twice does nothing.
   */
  dispose(): void;
}

/** Options for creating a surface instance with the session's `instantiateSurface`. */
export interface SurfaceInstanceOptions {
  /**
   * The instance's surface id, which must start with the contract's `surfaceInstanceIdPrefix`
   * (`template:`), so that it never collides with a surface the producer creates. Defaults to an
   * id derived from the template name, such as `template:search-box-1`, that no live instance
   * holds. Pass one that is the same on server and client, such as the prefix followed by React's
   * `useId`, when the surface is server-rendered.
   */
  surfaceId?: string;
}

export interface SurfaceInstances {
  create(template: string, options?: SurfaceInstanceOptions): SurfaceInstance;
  /** The template name of a live instance, or `undefined`. */
  templateOf(surfaceId: string): string | undefined;
  /** The `component` discriminant of a node of a live instance, or `undefined`. */
  resolve(surfaceId: string, nodeId: string): string | undefined;
  /** The component union of a live instance's template catalog, or `undefined`. */
  componentContractsOf(surfaceId: string): ContractsSchema | undefined;
  /** Appends the valid `updateDataModel` ops of A2-UI messages to the live instances they target. */
  apply(rawMessages: readonly unknown[]): void;
}

interface Instance {
  readonly template: string;
  readonly componentContracts: ContractsSchema;
  messages: readonly A2uiV09Message[];
}

export function createSurfaceInstances(
  templates: readonly SurfaceTemplate[],
  surfaceIdPrefix: string,
  callbacks: {onChange: () => void; onDispose: (surfaceId: string) => void}
): SurfaceInstances {
  const templatesByName = new Map(templates.map((template) => [template.template, template]));
  const instances = new Map<string, Instance>();
  const registry: NodeIdentityRegistry = new Map();

  function mintSurfaceId(template: string): string {
    let sequence = 1;
    while (instances.has(`${surfaceIdPrefix}${template}-${sequence}`)) {
      sequence++;
    }
    return `${surfaceIdPrefix}${template}-${sequence}`;
  }

  function create(name: string, options: SurfaceInstanceOptions = {}): SurfaceInstance {
    const declaration = templatesByName.get(name);
    if (!declaration) {
      throw new Error(`The session's contract declares no surface template "${name}".`);
    }
    const surfaceId = options.surfaceId ?? mintSurfaceId(name);
    if (!surfaceId.startsWith(surfaceIdPrefix)) {
      throw new Error(
        `The surface id "${surfaceId}" of a surface instance must start with "${surfaceIdPrefix}".`
      );
    }
    if (instances.has(surfaceId)) {
      throw new Error(`A live surface instance already holds the surface id "${surfaceId}".`);
    }

    const {template, componentContracts, ...createSurface} = declaration;
    const activities = [
      {
        id: `surface-instance:${surfaceId}`,
        kind: 'a2ui-surface',
        replace: false,
        payload: {messages: [{version: 'v1.0', createSurface: {...createSurface, surfaceId}}]},
      },
    ];
    const instance: Instance = {
      template,
      componentContracts,
      messages: deriveA2uiV09Messages(activities),
    };
    instances.set(surfaceId, instance);
    for (const [id, nodes] of deriveNodeIdentityRegistry(activities)) {
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

  function apply(rawMessages: readonly unknown[]): void {
    const updates = new Map<Instance, A2uiV09Message[]>();
    for (const op of readUpdateDataModelOps(rawMessages)) {
      const instance = instances.get(op.surfaceId);
      if (!instance) {
        continue;
      }
      const decision = validateInboundOp(op, registry, instance.componentContracts);
      if (decision.kind === 'forward') {
        const message: A2uiV09Message = {
          version: 'v0.9',
          updateDataModel: {surfaceId: op.surfaceId, path: decision.path, value: decision.value},
        };
        updates.set(instance, [...(updates.get(instance) ?? []), message]);
      }
    }
    for (const [instance, messages] of updates) {
      instance.messages = [...instance.messages, ...messages];
    }
    if (updates.size > 0) {
      callbacks.onChange();
    }
  }

  return {
    create,
    templateOf: (surfaceId) => instances.get(surfaceId)?.template,
    resolve: (surfaceId, nodeId) => registry.get(surfaceId)?.get(nodeId),
    componentContractsOf: (surfaceId) => instances.get(surfaceId)?.componentContracts,
    apply,
  };
}
