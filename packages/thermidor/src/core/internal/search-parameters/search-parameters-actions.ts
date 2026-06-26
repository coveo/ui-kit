import {createAction} from '@reduxjs/toolkit';
import {SingletonFactory} from '@/src/core/internal/singleton-factory/singleton-factory.js';

export function createSearchParametersActions(interfaceId: string) {
  return {
    setPipeline: createAction<string>(
      `${interfaceId}/searchParameters/setPipeline`
    ),
    setConstantQuery: createAction<string>(
      `${interfaceId}/searchParameters/setConstantQuery`
    ),
  };
}

export const getOrCreateSearchParametersActions = SingletonFactory(
  createSearchParametersActions
);
