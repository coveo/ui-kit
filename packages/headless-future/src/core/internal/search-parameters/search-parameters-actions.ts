import {createAction} from '@reduxjs/toolkit';

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

const actionsCache = new Map<
  string,
  ReturnType<typeof createSearchParametersActions>
>();
export function getOrCreateSearchParametersActions(interfaceId: string) {
  if (!actionsCache.has(interfaceId)) {
    actionsCache.set(interfaceId, createSearchParametersActions(interfaceId));
  }
  return actionsCache.get(interfaceId)!;
}
