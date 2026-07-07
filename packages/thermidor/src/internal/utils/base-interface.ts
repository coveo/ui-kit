import {InterfaceCacheRegistry} from './interface-cache-registry.js';
import type {FullEngine} from '@/src/internal/engine/index.js';
import type {
  EndpointThunk,
  EndpointStateScope,
  FacadeResolverFactory,
  Facades,
  InterfaceHandle,
  InterfaceType,
} from './interface-types.js';

export interface InterfaceInternals<T extends InterfaceType = InterfaceType> {
  engine: FullEngine;
  stateId: string;
  type: T;
  cacheRegistry: InterfaceCacheRegistry;
}

export let getInterfaceInternals: <T extends InterfaceType>(
  iface: BaseInterface<T>
) => InterfaceInternals<T>;

export abstract class BaseInterface<T extends InterfaceType> {
  get disposed(): boolean {
    return this.#disposed;
  }

  #engine: FullEngine;
  #stateId: string;
  #type: T;
  #facadeResolvers: Record<Facades[T], FacadeResolverFactory>;
  #facadeCache = new WeakMap<InterfaceHandle, Map<Facades[T], EndpointThunk>>();
  #cacheRegistry = new InterfaceCacheRegistry();
  #disposed = false;

  static {
    getInterfaceInternals = <typeof getInterfaceInternals>((iface) => ({
      engine: iface.#engine,
      stateId: iface.#stateId,
      type: iface.#type,
      cacheRegistry: iface.#cacheRegistry,
    }));
  }

  constructor(
    engine: FullEngine,
    stateId: string,
    type: T,
    resolvers: Record<Facades[T], FacadeResolverFactory>
  ) {
    this.#engine = engine;
    this.#stateId = stateId;
    this.#type = type;
    this.#facadeResolvers = resolvers;

    engine.addInterface(this);
  }

  resolveFacades(
    facade: Facades[T],
    composedInterface?: InterfaceHandle
  ): EndpointThunk[] {
    this.#assertNotDisposed();

    const scopeInterface = composedInterface ?? this;

    let scopeCache = this.#facadeCache.get(scopeInterface);
    if (!scopeCache) {
      scopeCache = new Map();
      this.#facadeCache.set(scopeInterface, scopeCache);
    }

    let thunk = scopeCache.get(facade);
    if (!thunk) {
      const scope: EndpointStateScope = {baseInterface: this, scopeInterface};
      const resolver = this.#facadeResolvers[facade];
      thunk = resolver(this.#engine)(scope);
      scopeCache.set(facade, thunk);
    }

    return [thunk];
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
      throw new Error('Cannot operate on a disposed interface.');
    }
  }
}
