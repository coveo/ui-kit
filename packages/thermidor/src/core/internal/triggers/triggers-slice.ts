import {createSlice} from '@reduxjs/toolkit';
import {SingletonFactory} from '@/src/core/internal/singleton-factory/singleton-factory.js';
import {getOrCreateTriggersActions, type Trigger} from './triggers-actions.js';

export interface TriggersState {
  triggers: Trigger[];
}

export const initialTriggersState: TriggersState = {triggers: []};

export function createTriggersSlice(interfaceId: string) {
  const actions = getOrCreateTriggersActions(interfaceId);
  return createSlice({
    name: `${interfaceId}/triggers`,
    initialState: initialTriggersState,
    reducers: {},
    extraReducers: (builder) => {
      builder.addCase(actions.setTriggers, (state, action) => {
        state.triggers = action.payload;
      });
    },
  });
}

export const getOrCreateTriggersSlice = SingletonFactory(createTriggersSlice);
