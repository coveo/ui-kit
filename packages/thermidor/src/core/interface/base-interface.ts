import {InterfaceCacheRegistry} from './cache/interface-cache-registry.js';
import type {FullEngine} from './engine/engine.js';
import type {
  EndpointThunk,
  EndpointStateScope,
  FacadeResolverFactory,
  Facades,
  InterfaceHandle,
  InterfaceType,
} from './utils/interface-types.js';

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
  #facadeCache = new Map<string, EndpointThunk>();
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
    const scope: EndpointStateScope = {
      baseInterface: this,
      scopeInterface,
    };

    const cacheKey = `${String(facade)}:${composedInterface ? 'composed' : this.#stateId}`;

    let thunk = this.#facadeCache.get(cacheKey);
    if (!thunk) {
      const resolver = this.#facadeResolvers[facade];
      thunk = resolver(this.#engine)(scope);
      this.#facadeCache.set(cacheKey, thunk);
    }

    return [thunk];
  }

  dispose(): void {
    if (this.#disposed) {
      return;
    }
    this.#disposed = true;
    this.#cacheRegistry.dispose();
    this.#facadeCache.clear();
    this.#engine.removeInterface(this);
  }

  #assertNotDisposed(): void {
    if (this.#disposed) {
      throw new Error('Cannot operate on a disposed interface.');
    }
  }
}
