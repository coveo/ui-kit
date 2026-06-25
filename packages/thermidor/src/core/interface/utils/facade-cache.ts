import type {FullEngine} from '@/src/core/interface/engine/engine.js';
import type {EndpointStateScope} from './interface-types.js';

export type FacadeFactory<T> = (
  engine: FullEngine,
  scope: EndpointStateScope
) => T;

export function createFacadeCache<T>(
  engine: FullEngine,
  factory: FacadeFactory<T>
) {
  const cache = new Map<string, T>();

  return (scope: EndpointStateScope): T => {
    const key = scope.composedInterfaceId ?? scope.interfaceId;
    if (!cache.has(key)) {
      cache.set(key, factory(engine, scope));
    }
    return cache.get(key) as T;
  };
}
