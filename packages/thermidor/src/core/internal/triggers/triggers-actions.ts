import {createAction} from '@reduxjs/toolkit';

export interface Trigger {
  type: string;
  content: string;
}

export function createTriggersActions(interfaceId: string) {
  return {
    setTriggers: createAction<Trigger[]>(`${interfaceId}/triggers/setTriggers`),
  };
}

const actionsCache = new Map<
  string,
  ReturnType<typeof createTriggersActions>
>();
export function getOrCreateTriggersActions(interfaceId: string) {
  if (!actionsCache.has(interfaceId)) {
    actionsCache.set(interfaceId, createTriggersActions(interfaceId));
  }
  return actionsCache.get(interfaceId)!;
}
