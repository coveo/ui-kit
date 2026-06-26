import {createAction} from '@reduxjs/toolkit';
import {SingletonFactory} from '@/src/core/internal/singleton-factory/singleton-factory.js';
import type {CoveoSearchResult} from '@/src/core/interface/api/search/search-types.js';

export function createResultsActions(interfaceId: string) {
  return {
    setResultsFromResponse: createAction<CoveoSearchResult[]>(
      `${interfaceId}/results/setResultsFromResponse`
    ),
  };
}

export const getOrCreateResultsActions = SingletonFactory(createResultsActions);
