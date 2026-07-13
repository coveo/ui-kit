import {createSlice} from '@reduxjs/toolkit';
import type {Product, ProductListState} from './product-list-types.js';
import {type CacheKey, createCacheKey} from '@/src/internal/utils/index.js';
import {getHandleInternals} from '@/src/internal/utils/index.js';
import type {InterfaceHandle} from '@/src/internal/utils/index.js';
import {getOrCreateProductListActions} from './product-list-actions.js';
import {getOrCreateHydrateFromSnapshotAction} from '@/src/internal/features/generative/index.js';

export const initialProductListState: ProductListState = {
  products: [],
};

function mapProduct(raw: Record<string, unknown>): Product {
  return {
    permanentid: (raw.permanentid as string) ?? '',
    ec_name: (raw.ec_name as string) ?? '',
    ec_description: raw.ec_description as string | undefined,
    ec_shortdesc: raw.ec_shortdesc as string | undefined,
    ec_brand: raw.ec_brand as string | undefined,
    ec_category: raw.ec_category as string[] | undefined,
    ec_price: raw.ec_price as number | undefined,
    ec_promo_price: raw.ec_promo_price as number | undefined,
    ec_images: raw.ec_images as string[] | undefined,
    ec_thumbnails: raw.ec_thumbnails as string[] | undefined,
    ec_in_stock: raw.ec_in_stock as boolean | undefined,
    ec_rating: raw.ec_rating as number | null | undefined,
    ec_color: raw.ec_color as string | undefined,
    ec_item_group_id: raw.ec_item_group_id as string | undefined,
    ec_item_group_name:
      (raw.ec_item_group_name as string) ??
      ((raw.additionalFields as Record<string, unknown>)?.ec_item_group_name as
        | string
        | undefined),
    clickUri: raw.clickUri as string | undefined,
    additionalFields: (raw.additionalFields as Record<string, unknown>) ?? {},
    children: Array.isArray(raw.children)
      ? raw.children.map((child: unknown) =>
          mapProduct(child as Record<string, unknown>)
        )
      : undefined,
  };
}

type ProductListSlice = ReturnType<typeof createProductListSlice>;

const CACHE_KEY: CacheKey<ProductListSlice> =
  createCacheKey<ProductListSlice>('productList/slice');

export function createProductListSlice(
  interfaceId: string,
  actions: ReturnType<typeof getOrCreateProductListActions>,
  hydrateAction: ReturnType<typeof getOrCreateHydrateFromSnapshotAction>
) {
  return createSlice({
    name: `${interfaceId}/products`,
    initialState: initialProductListState,
    reducers: {},
    extraReducers: (builder) => {
      builder.addCase(actions.setProductsFromResponse, (state, action) => {
        state.products = action.payload.map((p) =>
          mapProduct(p as Record<string, unknown>)
        );
      });
      builder.addCase(hydrateAction, (state, action) => {
        const payload = action.payload as Record<string, unknown> | null;
        if (!payload || !Array.isArray(payload.products)) {
          return;
        }
        state.products = payload.products.map((p: unknown) =>
          mapProduct(p as Record<string, unknown>)
        );
      });
    },
  });
}

export function getOrCreateProductListSlice(iface: InterfaceHandle) {
  const {stateId, cacheRegistry} = getHandleInternals(iface);
  return cacheRegistry.getOrCreate(CACHE_KEY, () => {
    const actions = getOrCreateProductListActions(iface);
    const hydrateAction = getOrCreateHydrateFromSnapshotAction(iface);
    return createProductListSlice(stateId, actions, hydrateAction);
  });
}
