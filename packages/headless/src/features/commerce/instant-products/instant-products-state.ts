import {SerializedError} from '@reduxjs/toolkit';
import {CommerceAPIErrorResponse} from '../../../api/commerce/commerce-api-error-response';
import {Product} from '../../../api/commerce/common/product';
import {
  InstantItemsCache,
  InstantItemsState,
} from '../../instant-items/instant-items-state';

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
