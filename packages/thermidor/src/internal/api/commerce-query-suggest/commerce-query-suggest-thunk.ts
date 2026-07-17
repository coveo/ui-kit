import {createAsyncThunk} from '@reduxjs/toolkit';
import type {InterfaceHandle} from '@/src/internal/utils/index.js';
import type {FullEngine} from '@/src/internal/engine/index.js';
import {getInterfaceInternals} from '@/src/internal/utils/index.js';

export function createCommerceSuggestionsThunk(
  _engine: FullEngine,
  iface: InterfaceHandle
) {
  const {stateId} = getInterfaceInternals(iface);

  return createAsyncThunk<void, {engine: FullEngine}>(
    `${stateId}/commerceSuggestions/execute`,
    async () => {
      /* TODO: implement commerce suggestions endpoint */
    }
  );
}
