import {createAction} from '@reduxjs/toolkit';
import {SingletonFactory} from '@/src/core/internal/singleton-factory/singleton-factory.js';

export function createSearchBoxActions(interfaceId: string) {
  return {
    setQuery: createAction<string>(`${interfaceId}/searchBox/setQuery`),
  };
}

export const getOrCreateSearchBoxActions = SingletonFactory(
  createSearchBoxActions
);
