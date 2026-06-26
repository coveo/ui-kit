import type {FullEngine} from './engine/engine.js';
import type {
  EndpointThunk,
  EndpointStateScope,
  FacadeResolverFactory,
  Facades,
  InterfaceType,
} from './utils/interface-types.js';
import {ENGINE, STATE_ID, TYPE} from './utils/symbols.js';

export abstract class BaseInterface<T extends InterfaceType> {
  readonly [ENGINE]: FullEngine;
  readonly [STATE_ID]: string;
  readonly [TYPE]: T;

  get disposed(): boolean {
    return this.#disposed;
  }

  #resolvers: Record<Facades[T], FacadeResolverFactory>;
  #facadeCache = new Map<string, EndpointThunk>();
  #disposed = false;

  constructor(
    engine: FullEngine,
    stateId: string,
    type: T,
    resolvers: Record<Facades[T], FacadeResolverFactory>
  ) {
    this[ENGINE] = engine;
    this[STATE_ID] = stateId;
    this[TYPE] = type;
    this.#resolvers = resolvers;
  }

  resolveFacades(
    facade: Facades[T],
    composedInterfaceId?: string
  ): EndpointThunk[] {
    if (this.#disposed) {
      throw new Error('Cannot resolve thunks on a disposed interface.');
    }

    const scope: EndpointStateScope = {
      interfaceId: this[STATE_ID],
      composedInterfaceId,
    };
    const cacheKey = `${String(facade)}:${composedInterfaceId ?? this[STATE_ID]}`;

    if (!this.#facadeCache.has(cacheKey)) {
      const resolver = this.#resolvers[facade];
      const thunk = resolver(this[ENGINE])(scope);
      this.#facadeCache.set(cacheKey, thunk);
    }

    return [this.#facadeCache.get(cacheKey)!];
  }

  dispose(): void {
    this.#disposed = true;
    this.#facadeCache.clear();
  }
}
