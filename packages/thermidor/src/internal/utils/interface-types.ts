import type {AsyncThunk} from '@reduxjs/toolkit';
import type {FullEngine} from '@/src/internal/engine/index.js';

export interface EndpointThunkArg {
  engine: FullEngine;
}

export interface InterfaceHandle {
  readonly disposed: boolean;
  dispose(): void;
}

export type EndpointThunk = AsyncThunk<void, EndpointThunkArg, {}>;

export type FacadeResolver = (iface: InterfaceHandle) => EndpointThunk;

interface InterfaceRegistry {
  generativeUnified: {interface: GenerativeUnifiedInterface; facades: 'conversation'};
}

export type InterfaceType = keyof InterfaceRegistry;

export type Facades = {[T in InterfaceType]: InterfaceRegistry[T]['facades']};

export declare const SupportsBrand: unique symbol;

export declare const InterfaceTypeBrand: unique symbol;

export type Supports<F extends Facades[InterfaceType]> = InterfaceHandle & {
  readonly [SupportsBrand]: {[K in F]: true};
};

/**
 * A generative unified interface handle: the disposable, opaque token returned
 * by {@link buildGenerativeUnifiedInterface} that unified controllers bind to.
 */
export interface GenerativeUnifiedInterface extends Supports<Facades['generativeUnified']> {
  readonly [InterfaceTypeBrand]: 'generativeUnified';
}
