import type {VNode} from '@stencil/core';

import type {FacetInfo} from './facet-common-store.js';
export type {FacetInfo};

export type FacetType =
  | 'facets'
  | 'numericFacets'
  | 'dateFacets'
  | 'categoryFacets';

export interface FacetValueFormat<ValueType> {
  format(facetValue: ValueType): string;
  content?(facetValue: ValueType): VNode;
}

export type FacetStore<F extends FacetInfo> = Record<string, F>;
