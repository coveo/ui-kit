import type {AsyncThunk} from '@reduxjs/toolkit';
import type {FullEngine} from '@/src/internal/engine/index.js';

export interface InterfaceHandle {
  readonly disposed: boolean;
  dispose(): void;
}

export type EndpointThunk = AsyncThunk<void, {engine: FullEngine}, {}>;

export type FacadeResolver = (iface: InterfaceHandle) => EndpointThunk;

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
