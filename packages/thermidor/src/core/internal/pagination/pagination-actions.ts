import {createAction} from '@reduxjs/toolkit';
import {SingletonFactory} from '@/src/core/internal/singleton-factory/singleton-factory.js';

export function createPaginationActions(interfaceId: string) {
  return {
    setFirstResult: createAction<number>(
      `${interfaceId}/pagination/setFirstResult`
    ),
    setPageSize: createAction<number>(`${interfaceId}/pagination/setPageSize`),
    setTotalCount: createAction<number>(
      `${interfaceId}/pagination/setTotalCount`
    ),
  };
}

export const getOrCreatePaginationActions = SingletonFactory(
  createPaginationActions
);
