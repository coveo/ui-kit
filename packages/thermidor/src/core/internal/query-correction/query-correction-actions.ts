import {createAction} from '@reduxjs/toolkit';
import {SingletonFactory} from '@/src/core/internal/singleton-factory/singleton-factory.js';

export interface QueryCorrection {
  correctedQuery: string;
  originalQuery: string;
}

export function createQueryCorrectionActions(interfaceId: string) {
  return {
    setQueryCorrection: createAction<QueryCorrection | null>(
      `${interfaceId}/queryCorrection/setQueryCorrection`
    ),
  };
}

export const getOrCreateQueryCorrectionActions = SingletonFactory(
  createQueryCorrectionActions
);
