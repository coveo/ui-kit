import type {FullEngine} from '@/src/core/interface/engine/engine.js';
import {SingletonFactory} from '@/src/core/internal/singleton-factory/singleton-factory.js';
import type {EndpointStateScope} from './interface-types.js';

const getScopeKey = (scope: EndpointStateScope): string =>
  scope.composedInterfaceId ?? scope.interfaceId;

export type FacadeFactory<T> = (
  engine: FullEngine,
  scope: EndpointStateScope
) => T;

export function createFacadeCache<T>(
  engine: FullEngine,
  factory: FacadeFactory<T>
) {
  return SingletonFactory<string, T, EndpointStateScope>(
    (scope) => factory(engine, scope),
    getScopeKey
  );
}
