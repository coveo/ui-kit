import type {VNode} from '@stencil/core';
import type {TemplateResult} from 'lit';

export interface FacetInfo {
  facetId: string;
  label: () => string;
  element: HTMLElement;
  isHidden(): boolean;
}

export type FacetType =
  | 'facets'
  | 'numericFacets'
  | 'dateFacets'
  | 'categoryFacets';

export interface FacetValueFormat<ValueType> {
  format(facetValue: ValueType): string;
  content?(facetValue: ValueType): VNode | TemplateResult;
}

export type FacetStore<F extends FacetInfo> = Record<string, F>;
