import {createAction} from '@reduxjs/toolkit';

export function createProductListActions(interfaceId: string) {
  return {
    setProductsFromResponse: createAction<unknown[]>(
      `${interfaceId}/products/setProductsFromResponse`
    ),
  };
}

const actionsCache = new Map<
  string,
  ReturnType<typeof createProductListActions>
>();
export function getOrCreateProductListActions(interfaceId: string) {
  if (!actionsCache.has(interfaceId)) {
    actionsCache.set(interfaceId, createProductListActions(interfaceId));
  }
  return actionsCache.get(interfaceId)!;
}
