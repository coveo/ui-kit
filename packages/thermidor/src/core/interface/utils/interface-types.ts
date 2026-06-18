import type {AsyncThunk} from '@reduxjs/toolkit';
import type {FullEngine} from '../engine/engine.js';
import {
  KIND,
  STATE_ID,
  ENGINE,
  THUNKS,
  THUNK_FACTORIES,
  INTERFACES,
} from './symbols.js';

export interface Operations {
  search: 'search' | 'suggestions';
  commerce: 'search' | 'suggestions';
  conversation: 'conversation' | 'search' | 'suggestions';
  generative: 'conversation';
}

export type EndpointThunk = AsyncThunk<void, {engine: FullEngine}, {}>;
export type EndpointThunkFactory = (
  engine: FullEngine,
  scope: EndpointStateScope
) => EndpointThunk;

export interface Interface<T extends keyof Operations = keyof Operations> {
  readonly [KIND]: 'interface';
  readonly [STATE_ID]: string;
  readonly [ENGINE]: FullEngine;
  readonly [THUNK_FACTORIES]: Record<Operations[T], EndpointThunkFactory[]>;
  readonly [THUNKS]: Record<Operations[T], EndpointThunk[]>;
}

export interface ComposedInterface<
  T extends keyof Operations = keyof Operations,
> {
  readonly [KIND]: 'composed';
  readonly [STATE_ID]: string;
  readonly [ENGINE]: FullEngine;
  readonly [INTERFACES]: Interface[];
  readonly [THUNKS]: Record<Operations[T], EndpointThunk[]>;
}

export type Requires<T extends Operations[keyof Operations]> = {
  readonly [STATE_ID]: string;
  readonly [ENGINE]: FullEngine;
  readonly [THUNKS]: Record<T, EndpointThunk[]>;
};

export interface EndpointStateScope {
  interfaceId: string;
  composedInterfaceId?: string;
}
