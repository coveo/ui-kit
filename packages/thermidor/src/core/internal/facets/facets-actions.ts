import {createAction} from '@reduxjs/toolkit';
import {SingletonFactory} from '@/src/core/internal/singleton-factory/singleton-factory.js';
import type {CoveoFacetResponse} from '@/src/core/interface/api/search/search-types.js';

export function createFacetsActions(interfaceId: string) {
  return {
    updateFromResponse: createAction<CoveoFacetResponse[] | undefined>(
      `${interfaceId}/facets/updateFromResponse`
    ),
    hydrateFromSnapshot: createAction<CoveoFacetResponse[] | undefined>(
      `${interfaceId}/facets/hydrateFromSnapshot`
    ),
  };
}

export const getOrCreateFacetsActions = SingletonFactory(createFacetsActions);
