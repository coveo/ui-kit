import {ENGINE, STATE_ID, TYPE} from '@/src/core/interface/utils/symbols.js';
import type {FullEngine} from '@/src/core/interface/engine/engine.js';
import type {
  EndpointThunk,
  Facades,
  InterfaceType,
} from '@/src/core/interface/utils/interface-types.js';
import {BaseInterface} from '@/src/core/interface/base-interface.js';
import {generateId} from '@/src/core/interface/utils/id-generator.js';

export class ComposedInterface<T extends InterfaceType> {
  readonly [ENGINE]: FullEngine;
  readonly [STATE_ID]: string;

  #interfaces: BaseInterface<T>[];

  constructor(
    interfaces: BaseInterface<T>[],
    composedId: string,
    engine: FullEngine
  ) {
    this[ENGINE] = engine;
    this[STATE_ID] = composedId;
    this.#interfaces = interfaces;
  }

  resolveFacades(
    facade: Facades[T],
    composedInterfaceId?: string
  ): EndpointThunk[] {
    const id = composedInterfaceId ?? this[STATE_ID];
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

  const engine = options.interfaces[0][ENGINE];
  const type = options.interfaces[0][TYPE];

  for (const iface of options.interfaces) {
    if (iface[ENGINE] !== engine) {
      throw new Error('All interfaces must share the same engine.');
    }
    if (iface[TYPE] !== type) {
      throw new Error(
        `All interfaces must share the same type. Expected '${type}', got '${iface[TYPE]}'.`
      );
    }
  }

  return new ComposedInterface(options.interfaces, generateId(), engine);
}
