import {createAction} from '@reduxjs/toolkit';
import {SingletonFactory} from '@/src/core/internal/singleton-factory/singleton-factory.js';

export interface Trigger {
  type: string;
  content: string;
}

export function createTriggersActions(interfaceId: string) {
  return {
    setTriggers: createAction<Trigger[]>(`${interfaceId}/triggers/setTriggers`),
  };
}

export const getOrCreateTriggersActions = SingletonFactory(
  createTriggersActions
);
