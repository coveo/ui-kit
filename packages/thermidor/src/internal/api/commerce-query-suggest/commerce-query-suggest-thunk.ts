import {createAsyncThunk} from '@reduxjs/toolkit';
import type {InterfaceHandle} from '@/src/internal/utils/index.js';
import type {EndpointThunkArg} from '@/src/internal/utils/interface-types.js';
import {getInterfaceInternals} from '@/src/internal/utils/index.js';

export function createCommerceSuggestionsThunk(iface: InterfaceHandle) {
  const {stateId} = getInterfaceInternals(iface);

  return createAsyncThunk<void, EndpointThunkArg>(
    `${stateId}/commerceSuggestions/execute`,
    async () => {
      /* TODO: implement commerce suggestions endpoint */
    }
  );
}
