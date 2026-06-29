import {createSlice} from '@reduxjs/toolkit';
import type {
  Product,
  ProductListState,
} from '@/src/core/interface/product-list/product-list-types.js';
import {getOrCreateProductListActions} from './product-list-actions.js';

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

export function createProductListSlice(interfaceId: string) {
  const actions = getOrCreateProductListActions(interfaceId);

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
    },
  });
}

const sliceCache = new Map<string, ReturnType<typeof createProductListSlice>>();
export function getOrCreateProductListSlice(interfaceId: string) {
  if (!sliceCache.has(interfaceId)) {
    sliceCache.set(interfaceId, createProductListSlice(interfaceId));
  }
  return sliceCache.get(interfaceId)!;
}
