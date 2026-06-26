import type {FullEngine} from './engine/engine.js';
import type {
  EndpointThunk,
  EndpointStateScope,
  FacadeResolverFactory,
  Facades,
  InterfaceType,
} from './utils/interface-types.js';

export interface InterfaceInternals<T extends InterfaceType = InterfaceType> {
  engine: FullEngine;
  stateId: string;
  type: T;
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
  #resolvers: Record<Facades[T], FacadeResolverFactory>;
  #facadeCache = new Map<string, EndpointThunk>();
  #disposed = false;

  static {
    getInterfaceInternals = (iface) => ({
      engine: iface.#engine,
      stateId: iface.#stateId,
      type: iface.#type,
    });
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
      interfaceId: this.#stateId,
      composedInterfaceId,
    };
    const cacheKey = `${String(facade)}:${composedInterfaceId ?? this.#stateId}`;

    if (!this.#facadeCache.has(cacheKey)) {
      const resolver = this.#resolvers[facade];
      const thunk = resolver(this.#engine)(scope);
      this.#facadeCache.set(cacheKey, thunk);
    }

    return [this.#facadeCache.get(cacheKey)!];
  }

  dispose(): void {
    this.#disposed = true;
    this.#facadeCache.clear();
  }
}
