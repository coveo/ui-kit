import type {AsyncThunk} from '@reduxjs/toolkit';
import type {FullEngine} from '@/src/internal/engine/index.js';

export interface InterfaceHandle {
  readonly disposed: boolean;
  dispose(): void;
}

export interface EndpointStateScope {
  baseInterface: InterfaceHandle;
  scopeInterface: InterfaceHandle;
}

export type EndpointThunk = AsyncThunk<void, {engine: FullEngine}, {}>;

export type FacadeResolver = (scope: EndpointStateScope) => EndpointThunk;

export type FacadeResolverFactory = (engine: FullEngine) => FacadeResolver;

export interface InterfaceRegistry {
  search: {interface: SearchInterface; facades: 'search' | 'suggestions'};
  commerce: {interface: CommerceInterface; facades: 'search' | 'suggestions'};
  generative: {interface: GenerativeInterface; facades: 'conversation'};
}

export type InterfaceType = keyof InterfaceRegistry;

export type Facades = {[T in InterfaceType]: InterfaceRegistry[T]['facades']};

export type InterfaceTypeMap = {
  [T in InterfaceType]: InterfaceRegistry[T]['interface'];
};

export type InferInterfaceType<I> = {
  [T in InterfaceType]: InterfaceTypeMap[T] extends I ? T : never;
}[InterfaceType];

export declare const SupportsBrand: unique symbol;

export type Supports<F extends Facades[InterfaceType]> = InterfaceHandle & {
  readonly [SupportsBrand]: {[K in F]: true};
};

export interface SearchInterface extends Supports<Facades['search']> {}

export interface CommerceInterface extends Supports<Facades['commerce']> {}

export interface GenerativeInterface extends Supports<Facades['generative']> {}

export interface ComposedInterface<T extends InterfaceType> extends Supports<Facades[T]> {}
