import type {AsyncThunk} from '@reduxjs/toolkit';
import type {FullEngine} from '../engine/engine.js';
import {
  KIND,
  TYPE,
  STATE_ID,
  ENGINE,
  INTERFACES,
  FACADE_RESOLVERS,
} from './symbols.js';

export type EndpointThunk = AsyncThunk<void, {engine: FullEngine}, {}>;

export interface EndpointStateScope {
  interfaceId: string;
  composedInterfaceId?: string;
}

export type FacadeResolver = (scope: EndpointStateScope) => EndpointThunk;

export interface Facades {
  search: 'search' | 'suggestions';
  commerce: 'search' | 'suggestions';
  generative: 'conversation';
}

export type InterfaceType = keyof Facades;

export interface Interface<T extends InterfaceType = InterfaceType> {
  readonly [KIND]: 'interface';
  readonly [TYPE]: T;
  readonly [STATE_ID]: string;
  readonly [ENGINE]: FullEngine;
  readonly [FACADE_RESOLVERS]: Record<Facades[T], FacadeResolver>;
}

export interface ComposedInterface<T extends InterfaceType = InterfaceType> {
  readonly [KIND]: 'composed';
  readonly [TYPE]: T;
  readonly [STATE_ID]: string;
  readonly [ENGINE]: FullEngine;
  readonly [INTERFACES]: Interface<T>[];
  readonly [FACADE_RESOLVERS]: Record<Facades[T], FacadeResolver>;
}

type InterfaceTypesWith<F extends Facades[InterfaceType]> = {
  [K in InterfaceType]: F extends Facades[K] ? K : never;
}[InterfaceType];

export type Supports<F extends Facades[InterfaceType]> =
  | Interface<InterfaceTypesWith<F>>
  | ComposedInterface<InterfaceTypesWith<F>>;
