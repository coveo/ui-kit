import type {AsyncThunk} from '@reduxjs/toolkit';
import type {FullEngine} from '@/src/internal/engine/index.js';

export type EndpointThunk = AsyncThunk<void, {engine: FullEngine}, {}>;

export interface InterfaceHandle {
  readonly disposed: boolean;
  dispose(): void;
}

export interface EndpointStateScope {
  baseInterface: InterfaceHandle;
  scopeInterface: InterfaceHandle;
}

export type FacadeResolver = (scope: EndpointStateScope) => EndpointThunk;

export type FacadeResolverFactory = (engine: FullEngine) => FacadeResolver;

export interface Facades {
  search: 'search' | 'suggestions';
  commerce: 'search' | 'suggestions';
  generative: 'conversation';
}

export type InterfaceType = keyof Facades;

export type Supports<F extends Facades[InterfaceType]> = {
  resolveFacades(
    facade: F,
    composedInterface?: InterfaceHandle
  ): EndpointThunk[];
  readonly disposed: boolean;
  dispose(): void;
};
