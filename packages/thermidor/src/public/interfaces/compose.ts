import {
  getInterfaceInternals,
  type BaseInterface,
} from '@/src/core/interface/base-interface.js';
import type {FullEngine} from '@/src/core/interface/engine/engine.js';
import type {
  EndpointThunk,
  Facades,
  InterfaceType,
} from '@/src/core/interface/utils/interface-types.js';
import {generateId} from '@/src/core/interface/utils/id-generator.js';

export interface ComposedInternals {
  engine: FullEngine;
  stateId: string;
}

export let getComposedInternals: <T extends InterfaceType>(
  composed: ComposedInterface<T>
) => ComposedInternals;

export class ComposedInterface<T extends InterfaceType> {
  #engine: FullEngine;
  #stateId: string;
  #interfaces: BaseInterface<T>[];

  static {
    getComposedInternals = <typeof getComposedInternals>((composed) => ({
      engine: composed.#engine,
      stateId: composed.#stateId,
    }));
  }

  constructor(interfaces: BaseInterface<T>[], composedId: string) {
    const {engine} = getInterfaceInternals(interfaces[0]);
    this.#engine = engine;
    this.#stateId = composedId;
    this.#interfaces = interfaces;
  }

  resolveFacades(
    facade: Facades[T],
    composedInterfaceId?: string
  ): EndpointThunk[] {
    const id = composedInterfaceId ?? this.#stateId;
    return this.#interfaces.flatMap((sub) => sub.resolveFacades(facade, id));
  }

  dispose(): void {
    // No-op: composed interface does not own sub-interface lifecycle
  }
}

export function composeInterfaces<T extends InterfaceType>(options: {
  interfaces: BaseInterface<T>[];
}): ComposedInterface<T> {
  if (options.interfaces.length === 0) {
    throw new Error('composeInterfaces requires at least one interface.');
  }

  const first = getInterfaceInternals(options.interfaces[0]);

  for (const iface of options.interfaces) {
    const internals = getInterfaceInternals(iface);
    if (internals.engine !== first.engine) {
      throw new Error('All interfaces must share the same engine.');
    }
    if (internals.type !== first.type) {
      throw new Error(
        `All interfaces must share the same type. Expected '${first.type}', got '${internals.type}'.`
      );
    }
  }

  return new ComposedInterface(options.interfaces, generateId());
}
