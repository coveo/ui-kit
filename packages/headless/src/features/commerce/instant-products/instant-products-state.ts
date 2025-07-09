import type {SerializedError} from '@reduxjs/toolkit';
import type {CommerceAPIErrorResponse} from '../../../api/commerce/commerce-api-error-response.js';
import type {Product} from '../../../api/commerce/common/product.js';
import type {
  InstantItemsCache,
  InstantItemsState,
} from '../../instant-items/instant-items-state.js';

export interface InstantProductsCache extends InstantItemsCache {
  error: CommerceAPIErrorResponse | SerializedError | null;
  products: Product[];
}

export type InstantProductsState = InstantItemsState<
  Record<string, InstantProductsCache>
>;

export function getInstantProductsInitialState(): InstantProductsState {
  return {};
}
