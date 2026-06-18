import {createSlice} from '@reduxjs/toolkit';
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

const sliceCache = new Map<string, ReturnType<typeof createTriggersSlice>>();
export function getOrCreateTriggersSlice(interfaceId: string) {
  if (!sliceCache.has(interfaceId)) {
    sliceCache.set(interfaceId, createTriggersSlice(interfaceId));
  }
  return sliceCache.get(interfaceId)!;
}
