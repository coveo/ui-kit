import type {AsyncThunk} from '@reduxjs/toolkit';
import type {FullEngine} from '../engine/engine.js';

export type EndpointThunk = AsyncThunk<void, {engine: FullEngine}, {}>;

export interface EndpointStateScope {
  interfaceId: string;
  composedInterfaceId?: string;
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
  resolveFacades(facade: F, composedInterfaceId?: string): EndpointThunk[];
  dispose(): void;
};
