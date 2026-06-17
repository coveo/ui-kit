import {createAction} from '@reduxjs/toolkit';
import type {CommerceSearchSort} from '@/src/api/interface/commerce-search-endpoint/commerce-search-endpoint-types.js';

export function createSortActions(interfaceId: string) {
  return {
    updateFromResponse: createAction<CommerceSearchSort | undefined>(
      `${interfaceId}/sort/updateFromResponse`
    ),
  };
}

const actionsCache = new Map<string, ReturnType<typeof createSortActions>>();
export function getOrCreateSortActions(interfaceId: string) {
  if (!actionsCache.has(interfaceId)) {
    actionsCache.set(interfaceId, createSortActions(interfaceId));
  }
  return actionsCache.get(interfaceId)!;
}
