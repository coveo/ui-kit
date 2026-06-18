import {createAction} from '@reduxjs/toolkit';

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

const actionsCache = new Map<
  string,
  ReturnType<typeof createQueryCorrectionActions>
>();
export function getOrCreateQueryCorrectionActions(interfaceId: string) {
  if (!actionsCache.has(interfaceId)) {
    actionsCache.set(interfaceId, createQueryCorrectionActions(interfaceId));
  }
  return actionsCache.get(interfaceId)!;
}
