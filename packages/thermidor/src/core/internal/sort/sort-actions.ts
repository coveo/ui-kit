import {createAction} from '@reduxjs/toolkit';
import {SingletonFactory} from '@/src/core/internal/singleton-factory/singleton-factory.js';
import type {CommerceSearchSort} from '@/src/api/interface/commerce-search-endpoint/commerce-search-endpoint-types.js';

export function createSortActions(interfaceId: string) {
  return {
    updateFromResponse: createAction<CommerceSearchSort | undefined>(
      `${interfaceId}/sort/updateFromResponse`
    ),
  };
}

export const getOrCreateSortActions = SingletonFactory(createSortActions);
