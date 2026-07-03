import {
  getInterfaceInternals,
  type BaseInterface,
} from '@/src/core/interface/base-interface.js';
import {InterfaceCacheRegistry} from '@/src/core/interface/cache/interface-cache-registry.js';
import type {FullEngine} from '@/src/core/interface/engine/engine.js';
import type {
  EndpointThunk,
  Facades,
  InterfaceHandle,
  InterfaceType,
} from '@/src/core/interface/utils/interface-types.js';
import {generateId} from '@/src/core/interface/utils/id-generator.js';

export interface ComposedInternals {
  engine: FullEngine;
  stateId: string;
  cacheRegistry: InterfaceCacheRegistry;
}

export let getComposedInternals: <T extends InterfaceType>(
  composed: ComposedInterface<T>
) => ComposedInternals;

export class ComposedInterface<T extends InterfaceType> {
  get disposed(): boolean {
    return this.#disposed;
  }

  #engine: FullEngine;
  #stateId: string;
  #interfaces: BaseInterface<T>[];
  #cacheRegistry = new InterfaceCacheRegistry();
  #disposed = false;

  static {
    getComposedInternals = <typeof getComposedInternals>((composed) => ({
      engine: composed.#engine,
      stateId: composed.#stateId,
      cacheRegistry: composed.#cacheRegistry,
    }));
  }

  constructor(interfaces: BaseInterface<T>[], composedId: string) {
    if (interfaces.length === 0) {
      throw new Error('ComposedInterface requires at least one interface.');
    }

    const {engine} = getInterfaceInternals(interfaces[0]);
    this.#engine = engine;
    this.#stateId = composedId;
    this.#interfaces = interfaces;

    engine.addInterface(this);
  }

  resolveFacades(
    facade: Facades[T],
    composedInterface?: InterfaceHandle
  ): EndpointThunk[] {
    this.#assertNotDisposed();
    const target = composedInterface ?? this;
    return this.#interfaces.flatMap((sub) =>
      sub.resolveFacades(facade, target)
    );
  }

  dispose(): void {
    if (this.#disposed) {
      return;
    }
    this.#disposed = true;
    this.#cacheRegistry.dispose();
    this.#engine.removeInterface(this);
  }

  #assertNotDisposed(): void {
    if (this.#disposed) {
      throw new Error('Cannot operate on a disposed composed interface.');
    }
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
