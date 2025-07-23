import type {Summary, FacetGenerator} from '@coveo/headless/commerce';
import type {
  SearchSummaryState,
  ProductListingSummaryState,
} from '@coveo/headless/commerce';
import {createContext} from '@lit/context';

export interface CommerceContext {
  summary: Summary<SearchSummaryState | ProductListingSummaryState>;
  facetGenerator: FacetGenerator;
}

export const commerceContext = createContext<CommerceContext>('commerce');
