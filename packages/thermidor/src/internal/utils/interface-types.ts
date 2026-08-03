import type {AsyncThunk} from '@reduxjs/toolkit';
import type {FullEngine} from '@/src/internal/engine/index.js';
import type {
  ExecuteSearchContext,
  ToggleFacetContext,
  ToggleExcludeFacetContext,
  DeselectAllFacetsContext,
  ToggleNumericFacetContext,
  SetNumericFacetRangeContext,
  SelectPageContext,
  SetPageSizeContext,
  SetSortContext,
  FetchMoreContext,
  RestoreStateContext,
  OverrideCorrectionContext,
  SelectProductsContext,
} from '@/src/internal/api/unified/unified-endpoint-types.js';

export type ActionIntent =
  | {name: 'execute_search'; context: ExecuteSearchContext}
  | {name: 'toggle_facet'; context: ToggleFacetContext}
  | {name: 'toggle_exclude_facet'; context: ToggleExcludeFacetContext}
  | {name: 'deselect_all_facets'; context: DeselectAllFacetsContext}
  | {name: 'toggle_numeric_facet'; context: ToggleNumericFacetContext}
  | {name: 'set_numeric_facet_range'; context: SetNumericFacetRangeContext}
  | {name: 'select_page'; context: SelectPageContext}
  | {name: 'set_page_size'; context: SetPageSizeContext}
  | {name: 'set_sort'; context: SetSortContext}
  | {name: 'fetch_more'; context: FetchMoreContext}
  | {name: 'restore_state'; context: RestoreStateContext}
  | {name: 'override_correction'; context: OverrideCorrectionContext}
  | {name: 'select_products'; context: SelectProductsContext};

export interface EndpointThunkArg {
  engine: FullEngine;
  actionIntent?: ActionIntent;
}

export interface InterfaceHandle {
  readonly disposed: boolean;
  dispose(): void;
}

export type EndpointThunk = AsyncThunk<void, EndpointThunkArg, {}>;

export type FacadeResolver = (iface: InterfaceHandle) => EndpointThunk;

export interface InterfaceRegistry {
  search: {interface: SearchInterface; facades: 'search' | 'suggestions'};
  commerce: {interface: CommerceInterface; facades: 'search' | 'suggestions'};
  generative: {interface: GenerativeInterface; facades: 'conversation'};
  generativeUnified: {interface: GenerativeUnifiedInterface; facades: 'conversation'};
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

export declare const InterfaceTypeBrand: unique symbol;

export type Supports<F extends Facades[InterfaceType]> = InterfaceHandle & {
  readonly [SupportsBrand]: {[K in F]: true};
};

export interface SearchInterface extends Supports<Facades['search']> {
  readonly [InterfaceTypeBrand]: 'search';
}

export interface CommerceInterface extends Supports<Facades['commerce']> {
  readonly [InterfaceTypeBrand]: 'commerce';
}

export interface GenerativeInterface extends Supports<Facades['generative']> {}

export interface GenerativeUnifiedInterface extends Supports<Facades['generativeUnified']> {}

export interface ComposedInterface<T extends InterfaceType> extends Supports<Facades[T]> {}
