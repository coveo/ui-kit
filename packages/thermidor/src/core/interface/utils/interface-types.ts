import type {AsyncThunk} from '@reduxjs/toolkit';
import type {FullEngine} from '../engine/engine.js';
import type {BaseInterface} from '../base-interface.js';
import type {ComposedInterface} from '@/src/public/interfaces/compose.js';

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

type InterfaceTypesWith<F extends Facades[InterfaceType]> = {
  [K in InterfaceType]: F extends Facades[K] ? K : never;
}[InterfaceType];

export type Supports<F extends Facades[InterfaceType]> =
  | BaseInterface<InterfaceTypesWith<F>>
  | ComposedInterface<InterfaceTypesWith<F>>;
