import {createAction} from '@reduxjs/toolkit';

export function createSearchBoxActions(interfaceId: string) {
  return {
    setQuery: createAction<string>(`${interfaceId}/searchBox/setQuery`),
  };
}

const actionsCache = new Map<
  string,
  ReturnType<typeof createSearchBoxActions>
>();
export function getOrCreateSearchBoxActions(interfaceId: string) {
  if (!actionsCache.has(interfaceId)) {
    actionsCache.set(interfaceId, createSearchBoxActions(interfaceId));
  }
  return actionsCache.get(interfaceId)!;
}
