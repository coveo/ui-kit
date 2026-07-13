import {InterfaceCacheRegistry} from '@/src/internal/utils/index.js';
import {getHandleInternals} from '@/src/internal/utils/index.js';
import type {FullEngine} from '@/src/internal/engine/index.js';
import type {
  EndpointThunk,
  Facades,
  InferInterfaceType,
  InterfaceHandle,
  InterfaceType,
  InterfaceTypeMap,
  Supports,
  SupportsBrand,
} from '@/src/internal/utils/index.js';
import {generateId} from '@/src/internal/utils/index.js';

export interface ComposedInternals {
  engine: FullEngine;
  stateId: string;
  cacheRegistry: InterfaceCacheRegistry;
  resolveFacades(
    facade: Facades[InterfaceType],
    composedInterface?: InterfaceHandle
  ): EndpointThunk[];
}

export let getComposedInternals: <T extends InterfaceType>(
  composed: ComposedInterfaceImpl<T>
) => ComposedInternals;

export interface ComposedInterface<T extends InterfaceType> extends Supports<
  Facades[T]
> {}

export class ComposedInterfaceImpl<
  T extends InterfaceType,
> implements ComposedInterface<T> {
  declare readonly [SupportsBrand]: {[K in Facades[T]]: true};

  get disposed(): boolean {
    return this.#disposed;
  }

  #engine: FullEngine;
  #stateId: string;
  #interfaces: InterfaceHandle[];
  #cacheRegistry = new InterfaceCacheRegistry();
  #disposed = false;

  static {
    getComposedInternals = <typeof getComposedInternals>((composed) => ({
      engine: composed.#engine,
      stateId: composed.#stateId,
      cacheRegistry: composed.#cacheRegistry,
      resolveFacades: (facade: any, composedInterface?: InterfaceHandle) =>
        composed.#resolveFacades(facade, composedInterface),
    }));
  }

  constructor(interfaces: InterfaceHandle[], composedId: string) {
    if (interfaces.length === 0) {
      throw new Error('ComposedInterface requires at least one interface.');
    }

    const {engine} = getHandleInternals(interfaces[0]);
    this.#engine = engine;
    this.#stateId = composedId;
    this.#interfaces = interfaces;

    engine.addInterface(this);
  }

  dispose(): void {
    if (this.#disposed) {
      return;
    }
    this.#disposed = true;
    this.#cacheRegistry.dispose();
    this.#engine.removeInterface(this);
  }

  #resolveFacades(
    facade: Facades[T],
    composedInterface?: InterfaceHandle
  ): EndpointThunk[] {
    this.#assertNotDisposed();
    const target = composedInterface ?? this;
    return this.#interfaces.flatMap((sub) => {
      const {resolveFacades} = getHandleInternals(sub);
      return resolveFacades(facade, target);
    });
  }

  #assertNotDisposed(): void {
    if (this.#disposed) {
      throw new Error('Cannot operate on a disposed composed interface.');
    }
  }
}

export function composeInterfaces<
  I extends InterfaceTypeMap[InterfaceType],
>(options: {interfaces: I[]}): ComposedInterface<InferInterfaceType<I>> {
  if (options.interfaces.length === 0) {
    throw new Error('composeInterfaces requires at least one interface.');
  }

  const first = getHandleInternals(options.interfaces[0]);

  for (const iface of options.interfaces) {
    const internals = getHandleInternals(iface);
    if (internals.engine !== first.engine) {
      throw new Error('All interfaces must share the same engine.');
    }
  }

  return new ComposedInterfaceImpl<InferInterfaceType<I>>(
    options.interfaces,
    generateId()
  );
}
