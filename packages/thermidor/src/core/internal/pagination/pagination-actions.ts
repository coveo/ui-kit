import {createAction} from '@reduxjs/toolkit';

function createPaginationActions(interfaceId: string) {
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

const actionsCache = new Map<
  string,
  ReturnType<typeof createPaginationActions>
>();
export function getOrCreatePaginationActions(interfaceId: string) {
  if (!actionsCache.has(interfaceId)) {
    actionsCache.set(interfaceId, createPaginationActions(interfaceId));
  }
  return actionsCache.get(interfaceId)!;
}
