import {InterfaceCacheRegistry} from './interface-cache-registry.js';
import type {FullEngine} from '@/src/internal/engine/index.js';
import type {
  EndpointThunk,
  FacadeResolver,
  Facades,
  InterfaceHandle,
  InterfaceType,
  SupportsBrand,
} from './interface-types.js';

export interface InterfaceInternals {
  engine: FullEngine;
  stateId: string;
  type: InterfaceType;
  cacheRegistry: InterfaceCacheRegistry;
  resolveFacade(facade: Facades[InterfaceType]): EndpointThunk;
}

export let getInterfaceInternals: (
  iface: InterfaceHandle
) => InterfaceInternals;

export abstract class BaseInterface<T extends InterfaceType> {
  declare readonly [SupportsBrand]: {[K in Facades[T]]: true};

  get disposed(): boolean {
    return this.#disposed;
  }

  #engine: FullEngine;
  #stateId: string;
  #type: T;
  #facadeResolvers: Record<Facades[T], FacadeResolver>;
  #facadeCache = new Map<Facades[T], EndpointThunk>();

  #cacheRegistry = new InterfaceCacheRegistry();
  #disposed = false;

  static {
    getInterfaceInternals = <typeof getInterfaceInternals>((iface) => {
      if (iface instanceof BaseInterface) {
        return {
          engine: iface.#engine,
          stateId: iface.#stateId,
          type: iface.#type,
          cacheRegistry: iface.#cacheRegistry,
          resolveFacade: (facade) => iface.#resolveFacade(facade),
        };
      }
      throw new Error(
        'Invalid interface handle: expected a BaseInterface instance.'
      );
    });
  }

  protected constructor(
    engine: FullEngine,
    stateId: string,
    type: T,
    resolvers: Record<Facades[T], FacadeResolver>
  ) {
    this.#engine = engine;
    this.#stateId = stateId;
    this.#type = type;
    this.#facadeResolvers = resolvers;

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

  #resolveFacade(facade: Facades[T]): EndpointThunk {
    this.#assertNotDisposed();

    const resolver = this.#facadeResolvers[facade];
    if (!resolver) {
      throw new Error(`No resolver registered for facade "${facade}".`);
    }

    let thunk = this.#facadeCache.get(facade);
    if (!thunk) {
      thunk = resolver(this);
      this.#facadeCache.set(facade, thunk);
    }

    return thunk;
  }

  #assertNotDisposed(): void {
    if (this.#disposed) {
      throw new Error('Cannot operate on a disposed interface.');
    }
  }
}
