import {createAction} from '@reduxjs/toolkit';
import {SingletonFactory} from '@/src/core/internal/singleton-factory/singleton-factory.js';

export function createProductListActions(interfaceId: string) {
  return {
    setProductsFromResponse: createAction<unknown[]>(
      `${interfaceId}/products/setProductsFromResponse`
    ),
  };
}

export const getOrCreateProductListActions = SingletonFactory(
  createProductListActions
);
